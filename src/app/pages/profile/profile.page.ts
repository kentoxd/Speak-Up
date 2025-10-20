import { Component, OnInit } from '@angular/core';
import { AlertController, ActionSheetController, ToastController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService, UserProfile } from '../../services/storage.service';
import { UserProgressionService } from '../../services/user-progression.service';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { UserProgression, Achievement } from '../../models/user-progression.model';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userProfile: UserProfile | null = null;
  userProgression$: Observable<UserProgression | null> = new Observable();
  isEditing = false;
  editProfile: Partial<UserProfile> = {};
  
  // Local data for immediate display
  localCompletedLessons = 0;
  localTotalLessons = 0;
  
  // Make Math available in template
  Math = Math;

  constructor(
    private storageService: StorageService,
    private userProgressionService: UserProgressionService,
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private modalController: ModalController,
    private afStorage: AngularFireStorage,
    private afStore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }


  async ngOnInit() {
    // Load user data from Firebase Auth instead of local storage
    this.authService.getCurrentUser().subscribe(async (user) => {
      if (user) {
        console.log('Profile page - User authenticated:', user);
        // Create a basic user profile from Firebase Auth data
        this.userProfile = {
          name: user.displayName || 'User',
          email: user.email,
          bio: '',
          avatar: user.photoURL || '',
          joinDate: new Date().toISOString(),
          totalLessons: 0,
          streakDays: 0,
          achievements: []
        };
        console.log('Profile page - User profile created:', this.userProfile);
        
        // Initialize user progression if not exists
        await this.userProgressionService.initializeUserProgression(user);
      } else {
        console.log('Profile page - No authenticated user');
        this.router.navigate(['/auth/signin']);
      }
    });
    
    // Load user progression data from Firebase
    this.userProgression$ = this.userProgressionService.getUserProgression();
    
    // Load additional user data
    await this.loadUserData();
  }

  async ionViewWillEnter() {
    // Refresh user data when entering the page
    this.authService.getCurrentUser().subscribe(async (user) => {
      if (user && !this.userProfile) {
        this.userProfile = {
          name: user.displayName || 'User',
          email: user.email,
          bio: '',
          avatar: user.photoURL || '',
          joinDate: new Date().toISOString(),
          totalLessons: 0,
          streakDays: 0,
          achievements: []
        };
      }
    });
    
    // Force refresh progression data
    await this.refreshProgressionData();
    
    // Refresh local lesson data
    await this.loadLocalLessonData();
  }

  private async refreshProgressionData() {
    // Get current user and ensure progression exists
    const user = await this.authService.getCurrentUser().pipe(take(1)).toPromise();
    if (user) {
      await this.userProgressionService.initializeUserProgression(user);
    }
    
    // Refresh the observable
    this.userProgression$ = this.userProgressionService.getUserProgression();
  }

  private async loadUserData() {
    // Load local lesson progress for immediate display
    await this.loadLocalLessonData();
  }

  private async loadLocalLessonData() {
    // Get lesson progress from local storage (same as home page)
    const allProgress = await this.storageService.getAllLessonProgress();
    const lessons = this.dataService.getAllLessons();
    this.localTotalLessons = lessons.length;
    this.localCompletedLessons = Object.values(allProgress).filter(p => p.completed).length;
  }

  async editProfileInfo() {
    if (!this.userProfile) return;

    this.editProfile = { ...this.userProfile };
    this.isEditing = true;
  }

  async saveProfile() {
    if (!this.userProfile || !this.editProfile.name?.trim()) {
      const toast = await this.toastController.create({
        message: 'Name is required',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    this.userProfile = { ...this.userProfile, ...this.editProfile };
    await this.storageService.setUserProfile(this.userProfile);
    this.isEditing = false;

    const toast = await this.toastController.create({
      message: 'Profile updated successfully!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

  cancelEdit() {
    this.isEditing = false;
    this.editProfile = {};
  }



  async changeAvatar() {
    // Only show this action sheet if we're in edit mode
    if (!this.isEditing) return;

    const actionSheet = await this.actionSheetController.create({
      header: 'Select Avatar',
      buttons: [
        {
          text: 'Choose from Gallery',
          handler: () => {
            this.selectImageFromGallery();
          },
        },
        {
          text: 'Default Avatar',
          handler: () => {
            this.updateEditAvatar('');
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  async selectImageFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      if (image && image.webPath) {
        await this.openImageCropper(image.webPath);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      const toast = await this.toastController.create({
        message: 'Error selecting image. Please try again.',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  private async openImageCropper(imagePath: string) {
    const croppedDataUrl = await this.createSquareCrop(imagePath);
    if (croppedDataUrl) {
      this.updateEditAvatar(croppedDataUrl);
    }
  }

  private createSquareCrop(imagePath: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }

        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        ctx.drawImage(img, x, y, size, size, 0, 0, size, size);

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve('');
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.9);
      };

      img.onerror = () => {
        console.error('Failed to load image');
        resolve('');
      };

      img.src = imagePath;
    });
  }

  private updateEditAvatar(avatarPath: string) {
    this.editProfile = { ...this.editProfile, avatar: avatarPath };
    
    this.toastController.create({
      message: 'Avatar updated! Tap save to confirm.',
      duration: 2000,
      color: 'success'
    }).then(t => t.present());
  }

  getJoinedDaysAgo(): number {
    if (!this.userProfile?.joinDate) return 0;
    const joinDate = new Date(this.userProfile.joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getAchievementProgress(progression: UserProgression | null): number {
    if (!progression || !progression.achievements) return 0;
    const totalPossible = 10;
    const earned = progression.achievements.length;
    return Math.round((earned / totalPossible) * 100);
  }

  getLevelProgress(progression: UserProgression | null): number {
    if (!progression) return 0;
    const currentLevel = progression.level;
    const pointsForCurrentLevel = (currentLevel - 1) * (currentLevel - 1) * 100;
    const pointsForNextLevel = currentLevel * currentLevel * 100;
    const progress = ((progression.totalPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
    return Math.max(0, Math.min(100, progress));
  }

  getWeeklyGoalProgress(progression: UserProgression | null): number {
    if (!progression) return 0;
    return Math.min(100, (progression.totalSpeakingTime / progression.weeklyGoal) * 100);
  }

  getMonthlyGoalProgress(progression: UserProgression | null): number {
    if (!progression) return 0;
    return Math.min(100, (progression.totalPracticeSessions / progression.monthlyGoal) * 100);
  }

  getRecentAchievements(progression: UserProgression | null): Achievement[] {
    if (!progression) return [];
    return progression.achievements
      .sort((a, b) => {
        const aTime = a.unlockedAt instanceof Date ? 
          a.unlockedAt.getTime() : 
          (a.unlockedAt as any).toDate ? (a.unlockedAt as any).toDate().getTime() : new Date(a.unlockedAt).getTime();
        const bTime = b.unlockedAt instanceof Date ? 
          b.unlockedAt.getTime() : 
          (b.unlockedAt as any).toDate ? (b.unlockedAt as any).toDate().getTime() : new Date(b.unlockedAt).getTime();
        return bTime - aTime;
      })
      .slice(0, 3);
  }

  getPracticeTypeStats(progression: UserProgression | null) {
    if (!progression) return [];
    return [
      {
        type: 'Monologue',
        sessions: progression.practiceStats.monologue.sessionsCompleted,
        accuracy: progression.practiceStats.monologue.averageAccuracy,
        time: progression.practiceStats.monologue.totalTime
      },
      {
        type: 'Public Speaking',
        sessions: progression.practiceStats.publicSpeaking.sessionsCompleted,
        accuracy: progression.practiceStats.publicSpeaking.averageAccuracy,
        time: progression.practiceStats.publicSpeaking.totalTime
      },
      {
        type: 'Debate',
        sessions: progression.practiceStats.debate.sessionsCompleted,
        accuracy: progression.practiceStats.debate.averageAccuracy,
        time: progression.practiceStats.debate.totalTime
      }
    ];
  }

  navigateToFAQ() {
    this.router.navigate(['/faq']);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Sign Out',
          role: 'destructive',
          handler: async () => {
            try {
              await this.authService.signOut();
              console.log('Logout completed successfully');
              this.router.navigate(['/auth/signin']);
            } catch (error) {
              console.error('Logout error:', error);
              const toast = await this.toastController.create({
                message: 'Error signing out. Please try again.',
                duration: 3000,
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}