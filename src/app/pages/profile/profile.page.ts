import { Component, OnInit } from '@angular/core';
import { AlertController, ActionSheetController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService, UserProfile } from '../../services/storage.service';
import { UserProgressionService } from '../../services/user-progression.service';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { UserProgression, Achievement } from '../../models/user-progression.model';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

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
  darkModeEnabled = false;
  showAnalytics = true; // Always show analytics
  
  // Local data for immediate display
  localCompletedLessons = 0;
  localTotalLessons = 0;

  constructor(
    private storageService: StorageService,
    private userProgressionService: UserProgressionService,
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController
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
        this.router.navigate(['/login']);
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
    // Load user preferences
    this.darkModeEnabled = await this.storageService.getDarkModeEnabled();
    
    // Load local lesson progress for immediate display
    await this.loadLocalLessonData();
  }

  private async loadLocalLessonData() {
    // Get lesson progress from local storage (same as home page)
    const allProgress = await this.storageService.getAllLessonProgress();
    const lessons = this.dataService.getLessons();
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
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Avatar',
      buttons: [
        {
          text: 'Default Avatar',
          handler: () => {
            this.updateAvatar('');
          }
        },
        {
          text: 'Avatar 1',
          handler: () => {
            this.updateAvatar('assets/avatars/avatar1.png');
          }
        },
        {
          text: 'Avatar 2',
          handler: () => {
            this.updateAvatar('assets/avatars/avatar2.png');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  private async updateAvatar(avatarPath: string) {
    if (this.userProfile) {
      this.userProfile.avatar = avatarPath;
      await this.storageService.setUserProfile(this.userProfile);
      
      const toast = await this.toastController.create({
        message: 'Avatar updated!',
        duration: 1500,
        color: 'success'
      });
      await toast.present();
    }
  }

  async toggleDarkMode() {
    this.darkModeEnabled = !this.darkModeEnabled;
    await this.storageService.setDarkModeEnabled(this.darkModeEnabled);
    
    // Apply dark mode class to body
    document.body.classList.toggle('dark', this.darkModeEnabled);
    
    const toast = await this.toastController.create({
      message: `${this.darkModeEnabled ? 'Dark' : 'Light'} mode enabled`,
      duration: 1500,
      color: 'primary'
    });
    await toast.present();
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
    // Calculate progress based on total possible achievements vs earned
    const totalPossible = 10; // Total possible achievements in the system
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
    // This would need to be calculated based on current week's progress
    return Math.min(100, (progression.totalSpeakingTime / progression.weeklyGoal) * 100);
  }

  getMonthlyGoalProgress(progression: UserProgression | null): number {
    if (!progression) return 0;
    // This would need to be calculated based on current month's progress
    return Math.min(100, (progression.totalPracticeSessions / progression.monthlyGoal) * 100);
  }

  getRecentAchievements(progression: UserProgression | null): Achievement[] {
    if (!progression) return [];
    return progression.achievements
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
      .slice(0, 3);
  }

  getAccuracyTrend(progression: UserProgression | null): number[] {
    if (!progression) return [];
    return progression.accuracyHistory
      .slice(-7) // Last 7 records
      .map(record => record.accuracy);
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
              // The authService.signOut() already handles navigation to /login
              console.log('Logout completed successfully');
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
