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

export interface TopicProgress {
  topicId: string;
  completed: boolean;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  quizUnlocked: boolean;
  quizCompleted: boolean;
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

  // Topic Progress
  async getTopicProgress(topicId: string): Promise<TopicProgress | null> {
    const allProgress = await this._storage?.get('topicProgress') || {};
    return allProgress[topicId] || null;
  }

  async setTopicProgress(topicId: string, progress: TopicProgress): Promise<void> {
    const allProgress = await this._storage?.get('topicProgress') || {};
    allProgress[topicId] = progress;
    await this._storage?.set('topicProgress', allProgress);
  }

  async getAllTopicProgress(): Promise<{[key: string]: TopicProgress}> {
    return await this._storage?.get('topicProgress') || {};
  }

  async updateTopicProgress(topicId: string, lessonCompleted: boolean): Promise<TopicProgress> {
    const currentProgress = await this.getTopicProgress(topicId);
    const now = new Date().toISOString();
    
    if (!currentProgress) {
      const newProgress: TopicProgress = {
        topicId,
        completed: false,
        progress: lessonCompleted ? 20 : 0, // 20% per lesson (5 lessons total)
        lessonsCompleted: lessonCompleted ? 1 : 0,
        totalLessons: 5,
        quizUnlocked: lessonCompleted && 1 >= 5, // Unlock when all lessons done
        quizCompleted: false,
        lastAccessed: now
      };
      await this.setTopicProgress(topicId, newProgress);
      return newProgress;
    }

    const updatedProgress: TopicProgress = {
      ...currentProgress,
      lessonsCompleted: lessonCompleted ? currentProgress.lessonsCompleted + 1 : currentProgress.lessonsCompleted,
      progress: Math.min(100, (currentProgress.lessonsCompleted + (lessonCompleted ? 1 : 0)) * 20),
      quizUnlocked: (currentProgress.lessonsCompleted + (lessonCompleted ? 1 : 0)) >= 5,
      completed: (currentProgress.lessonsCompleted + (lessonCompleted ? 1 : 0)) >= 5,
      lastAccessed: now
    };

    await this.setTopicProgress(topicId, updatedProgress);
    return updatedProgress;
  }

  // Clear all stored data
  async clearAllData(): Promise<void> {
    await this._storage?.clear();
  }
}
