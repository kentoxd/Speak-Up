import { Component, OnInit } from '@angular/core';
import { AlertController, ActionSheetController, ToastController } from '@ionic/angular';
import { StorageService, UserProfile } from '../../services/storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userProfile: UserProfile | null = null;
  currentStreak = 0;
  isEditing = false;
  editProfile: Partial<UserProfile> = {};
  darkModeEnabled = false;

  achievements = [
    { id: 'first-lesson', title: 'First Steps', description: 'Completed your first lesson', icon: 'school', earned: false },
    { id: 'week-streak', title: 'Week Warrior', description: '7-day learning streak', icon: 'flame', earned: false },
    { id: 'quiz-master', title: 'Quiz Master', description: 'Scored 100% on a quiz', icon: 'trophy', earned: false },
    { id: 'practice-pro', title: 'Practice Pro', description: 'Completed 10 practice sessions', icon: 'mic', earned: false },
    { id: 'lesson-complete', title: 'Course Crusher', description: 'Completed all available lessons', icon: 'medal', earned: false }
  ];

  constructor(
    private storageService: StorageService,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    await this.loadUserData();
  }

  async ionViewWillEnter() {
    await this.loadUserData();
  }

  private async loadUserData() {
    this.userProfile = await this.storageService.getUserProfile();
    this.currentStreak = await this.storageService.getCurrentStreak();
    this.darkModeEnabled = await this.storageService.getDarkModeEnabled();
    
    // Check achievements
    await this.checkAchievements();
  }

  private async checkAchievements() {
    if (!this.userProfile) return;

    const allProgress = await this.storageService.getAllLessonProgress();
    const completedLessons = Object.values(allProgress).filter(p => p.completed).length;
    const practiceHistory = await this.storageService.getPracticeHistory();

    // Update achievements based on progress
    this.achievements.forEach(achievement => {
      switch (achievement.id) {
        case 'first-lesson':
          achievement.earned = completedLessons > 0;
          break;
        case 'week-streak':
          achievement.earned = this.currentStreak >= 7;
          break;
        case 'practice-pro':
          achievement.earned = practiceHistory.length >= 10;
          break;
        case 'lesson-complete':
          achievement.earned = completedLessons >= 5; // Assuming 5 total lessons
          break;
      }
    });
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

  getEarnedAchievements() {
    return this.achievements.filter(a => a.earned);
  }

  getAchievementProgress(): number {
    const earned = this.getEarnedAchievements().length;
    return Math.round((earned / this.achievements.length) * 100);
  }

}
