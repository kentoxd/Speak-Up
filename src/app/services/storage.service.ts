import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  joinDate: string;
  totalLessons: number;
  streakDays: number;
  achievements: string[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  progress: number;
  lastAccessed: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // User Profile methods
  async getUserProfile(): Promise<UserProfile | null> {
    return this._storage?.get('userProfile') || null;
  }

  async setUserProfile(profile: UserProfile): Promise<void> {
    await this._storage?.set('userProfile', profile);
  }

  // Theme methods
  async getDarkModeEnabled(): Promise<boolean> {
    const stored = await this._storage?.get('darkModeEnabled');
    return stored !== undefined ? stored : true; // Default to dark mode
  }

  async setDarkModeEnabled(enabled: boolean): Promise<void> {
    await this._storage?.set('darkModeEnabled', enabled);
  }

  // First time user
  async isFirstTimeUser(): Promise<boolean> {
    return !(await this._storage?.get('hasSeenWelcome')) || false;
  }

  async setHasSeenWelcome(): Promise<void> {
    await this._storage?.set('hasSeenWelcome', true);
  }

  // Lesson Progress
  async getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
    const allProgress = await this._storage?.get('lessonProgress') || {};
    return allProgress[lessonId] || null;
  }

  async setLessonProgress(lessonId: string, progress: LessonProgress): Promise<void> {
    const allProgress = await this._storage?.get('lessonProgress') || {};
    allProgress[lessonId] = progress;
    await this._storage?.set('lessonProgress', allProgress);
  }

  async getAllLessonProgress(): Promise<{[key: string]: LessonProgress}> {
    return await this._storage?.get('lessonProgress') || {};
  }

  // Practice History
  async getPracticeHistory(): Promise<any[]> {
    return await this._storage?.get('practiceHistory') || [];
  }

  async addPracticeSession(session: any): Promise<void> {
    const history = await this.getPracticeHistory();
    history.push(session);
    await this._storage?.set('practiceHistory', history);
  }

  // Streak tracking
  async updateStreak(): Promise<number> {
    const today = new Date().toDateString();
    const lastAccess = await this._storage?.get('lastAccessDate');
    let streak = await this._storage?.get('currentStreak') || 0;

    if (lastAccess !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastAccess === yesterday.toDateString()) {
        streak += 1;
      } else if (lastAccess !== today) {
        streak = 1;
      }
      
      await this._storage?.set('currentStreak', streak);
      await this._storage?.set('lastAccessDate', today);
    }

    return streak;
  }

  async getCurrentStreak(): Promise<number> {
    return await this._storage?.get('currentStreak') || 0;
  }
}
