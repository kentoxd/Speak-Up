import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { DataService } from './data.service';
import { BehaviorSubject } from 'rxjs';
import { SavedCustomText } from '../pages/practice/practice.page';

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
  private readonly SAVED_CUSTOM_TEXTS_KEY = 'saved_custom_texts';
  
  // BehaviorSubject to notify of progress changes
  private topicProgressChanged = new BehaviorSubject<string | null>(null);
  public topicProgressChanged$ = this.topicProgressChanged.asObservable();

  constructor(private storage: Storage, private dataService: DataService) {
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
    
    // Notify subscribers of progress change
    this.topicProgressChanged.next(topicId);
  }

  async getAllTopicProgress(): Promise<{[key: string]: TopicProgress}> {
    return await this._storage?.get('topicProgress') || {};
  }

  async updateTopicProgress(topicId: string, lessonCompleted: boolean): Promise<TopicProgress> {
    const topic = this.dataService.getTopic(topicId);
    if (!topic) throw new Error('Topic not found');

    let progress = await this.getTopicProgress(topicId) || {
      topicId,
      lessonsCompleted: 0,
      progress: 0,
      completed: false,
      quizUnlocked: false,
      quizCompleted: false,
      totalLessons: topic.lessons.length,
      lastAccessed: new Date().toISOString()
    };

    if (lessonCompleted) {
      if (progress.lessonsCompleted < topic.lessons.length) {
        progress.lessonsCompleted += 1;
      }
    }

    progress.progress = (progress.lessonsCompleted / topic.lessons.length) * 100;
    progress.completed = progress.lessonsCompleted === topic.lessons.length;
    progress.quizUnlocked = progress.completed;
    progress.lastAccessed = new Date().toISOString();

    await this.setTopicProgress(topicId, progress);
    return progress;
  }

  // Saved Custom Texts methods
  async getSavedCustomTexts(): Promise<SavedCustomText[]> {
    try {
      const texts = await this._storage?.get(this.SAVED_CUSTOM_TEXTS_KEY);
      return texts || [];
    } catch (error) {
      console.error('Error loading saved custom texts:', error);
      return [];
    }
  }

  async addSavedCustomText(customText: SavedCustomText): Promise<void> {
    try {
      const texts = await this.getSavedCustomTexts();
      texts.unshift(customText); // Add to beginning of array
      await this._storage?.set(this.SAVED_CUSTOM_TEXTS_KEY, texts);
    } catch (error) {
      console.error('Error saving custom text:', error);
      throw error;
    }
  }

  async deleteSavedCustomText(id: string): Promise<void> {
    try {
      const texts = await this.getSavedCustomTexts();
      const filteredTexts = texts.filter(text => text.id !== id);
      await this._storage?.set(this.SAVED_CUSTOM_TEXTS_KEY, filteredTexts);
    } catch (error) {
      console.error('Error deleting custom text:', error);
      throw error;
    }
  }

  async updateSavedCustomText(id: string, updatedText: Partial<SavedCustomText>): Promise<void> {
    try {
      const texts = await this.getSavedCustomTexts();
      const index = texts.findIndex(text => text.id === id);
      if (index !== -1) {
        texts[index] = { ...texts[index], ...updatedText };
        await this._storage?.set(this.SAVED_CUSTOM_TEXTS_KEY, texts);
      }
    } catch (error) {
      console.error('Error updating custom text:', error);
      throw error;
    }
  }

  // Clear all stored data
  async clearAllData(): Promise<void> {
    await this._storage?.clear();
  }
}