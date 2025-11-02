import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PreferencesService, UserPreferences } from '../../services/preferences.service';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { StorageService } from '../../services/storage.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  preferences: UserPreferences | null = null;
  isLoading = false;

  constructor(
    private preferencesService: PreferencesService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private errorHandler: ErrorHandlerService,
    private storageService: StorageService,
    private afStore: AngularFirestore
  ) {}

  async ngOnInit() {
    this.preferencesService.preferences$.subscribe(prefs => {
      this.preferences = prefs;
    });
  }

  async updatePreference(key: keyof UserPreferences, value: any) {
    if (!this.preferences) return;

    try {
      await this.preferencesService.updatePreferences({
        [key]: value
      } as Partial<UserPreferences>);
    } catch (error) {
      await this.errorHandler.showError(error);
    }
  }

  async updateNestedPreference(
    category: 'notifications' | 'privacy' | 'accessibility',
    key: string,
    value: any
  ) {
    if (!this.preferences) return;

    const updates: any = {
      [category]: {
        ...this.preferences[category],
        [key]: value
      }
    };

    await this.updatePreference(category as keyof UserPreferences, updates[category]);
  }

  async clearPracticeHistory() {
    const alert = await this.alertController.create({
      header: 'Clear Practice History',
      message: 'Are you sure you want to delete all your practice history? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clear',
          role: 'destructive',
          handler: async () => {
            try {
              // Clear local storage
              await this.storageService.clearPracticeHistory();
              
              // Clear Firestore sessions
              const user = await this.authService.getCurrentUser().pipe(take(1)).toPromise();
              if (user) {
                const sessionsRef = this.afStore.collection('users')
                  .doc(user.uid)
                  .collection('practiceSessions');
                
                const snapshot = await sessionsRef.ref.get();
                const batch = this.afStore.firestore.batch();
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
              }

              await this.errorHandler.showSuccess('Practice history cleared successfully');
            } catch (error) {
              await this.errorHandler.showError(error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async exportData() {
    try {
      this.isLoading = true;
      const dataJson = await this.preferencesService.exportUserData();
      
      // Create download link
      const blob = new Blob([dataJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `speakup-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await this.errorHandler.showSuccess('Data exported successfully');
    } catch (error) {
      await this.errorHandler.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteAccount() {
    const alert = await this.alertController.create({
      header: 'Delete Account',
      message: 'Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone.',
      inputs: [
        {
          name: 'confirm',
          type: 'text',
          placeholder: 'Type DELETE to confirm',
          attributes: {
            maxlength: 10
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete Account',
          role: 'destructive',
          handler: async (data) => {
            if (data.confirm !== 'DELETE') {
              await this.errorHandler.showWarning('Please type DELETE to confirm');
              return false;
            }

            // Delete account logic here
            await this.errorHandler.showWarning('Account deletion is not yet implemented. Please contact support.');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async resetPreferences() {
    const alert = await this.alertController.create({
      header: 'Reset Preferences',
      message: 'Reset all preferences to default values?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reset',
          handler: async () => {
            try {
              await this.preferencesService.resetToDefaults();
              await this.errorHandler.showSuccess('Preferences reset to defaults');
            } catch (error) {
              await this.errorHandler.showError(error);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}

