import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service';
import { take, switchMap } from 'rxjs/operators';

export interface UserPreferences {
  // Practice Preferences
  autoStartRecording: boolean;
  recordingQuality: 'low' | 'medium' | 'high';
  feedbackDetailLevel: number; // 1-10
  showTips: boolean;
  
  // Notifications
  notifications: {
    practiceReminders: boolean;
    achievementAlerts: boolean;
    weeklyProgressSummary: boolean;
  };
  
  // Privacy & Data
  privacy: {
    shareAnonymousUsageData: boolean;
  };
  
  // Accessibility
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrastMode: boolean;
    screenReaderOptimizations: boolean;
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  autoStartRecording: false,
  recordingQuality: 'medium',
  feedbackDetailLevel: 7,
  showTips: true,
  notifications: {
    practiceReminders: true,
    achievementAlerts: true,
    weeklyProgressSummary: true
  },
  privacy: {
    shareAnonymousUsageData: false
  },
  accessibility: {
    fontSize: 'medium',
    highContrastMode: false,
    screenReaderOptimizations: false
  }
};

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private preferencesSubject = new BehaviorSubject<UserPreferences>(DEFAULT_PREFERENCES);
  public preferences$: Observable<UserPreferences> = this.preferencesSubject.asObservable();

  constructor(
    private afStore: AngularFirestore,
    private authService: AuthService
  ) {
    this.loadPreferences();
  }

  /**
   * Load user preferences from Firestore
   */
  private async loadPreferences(): Promise<void> {
    this.authService.getCurrentUser()
      .pipe(
        take(1),
        switchMap(user => {
          if (!user) {
            this.preferencesSubject.next(DEFAULT_PREFERENCES);
            return [];
          }
          
          return this.afStore
            .collection('users')
            .doc(user.uid)
            .collection('preferences')
            .doc('settings')
            .valueChanges();
        })
      )
      .subscribe((prefs: any) => {
        if (prefs) {
          // Merge with defaults to ensure all properties exist
          const merged = { ...DEFAULT_PREFERENCES, ...prefs };
          this.preferencesSubject.next(merged);
        } else {
          // Save default preferences if none exist
          this.savePreferences(DEFAULT_PREFERENCES);
        }
      });
  }

  /**
   * Get current preferences
   */
  getPreferences(): UserPreferences {
    return this.preferencesSubject.value;
  }

  /**
   * Update a specific preference category
   */
  async updatePreferences(updates: Partial<UserPreferences>): Promise<void> {
    const user = await this.authService.getCurrentUser().pipe(take(1)).toPromise();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const currentPrefs = this.preferencesSubject.value;
    const newPrefs = { ...currentPrefs, ...updates };
    
    // Update local state immediately
    this.preferencesSubject.next(newPrefs);

    // Save to Firestore
    try {
      await this.afStore
        .collection('users')
        .doc(user.uid)
        .collection('preferences')
        .doc('settings')
        .set(newPrefs, { merge: true });
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Revert local state on error
      this.preferencesSubject.next(currentPrefs);
      throw error;
    }
  }

  /**
   * Save preferences (used for initial save)
   */
  private async savePreferences(preferences: UserPreferences): Promise<void> {
    const user = await this.authService.getCurrentUser().pipe(take(1)).toPromise();
    if (!user) return;

    try {
      await this.afStore
        .collection('users')
        .doc(user.uid)
        .collection('preferences')
        .doc('settings')
        .set(preferences);
      
      this.preferencesSubject.next(preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Reset to default preferences
   */
  async resetToDefaults(): Promise<void> {
    await this.updatePreferences(DEFAULT_PREFERENCES);
  }

  /**
   * Export user data
   */
  async exportUserData(): Promise<string> {
    const user = await this.authService.getCurrentUser().pipe(take(1)).toPromise();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const prefs = this.getPreferences();
    const data = {
      preferences: prefs,
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }
}

