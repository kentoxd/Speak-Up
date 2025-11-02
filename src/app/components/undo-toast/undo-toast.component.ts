import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { UndoService, UndoableAction } from '../../services/undo.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-undo-toast',
  template: ``, // This component manages toasts programmatically
  styles: ['']
})
export class UndoToastComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;
  private currentToast?: HTMLIonToastElement;

  constructor(
    private toastController: ToastController,
    private undoService: UndoService
  ) {}

  ngOnInit() {
    // Subscribe to undo availability
    this.subscription = this.undoService.undoAvailable$.subscribe(action => {
      if (action) {
        this.showUndoToast(action);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.currentToast) {
      this.currentToast.dismiss();
    }
  }

  private async showUndoToast(action: UndoableAction) {
    // Dismiss any existing toast
    if (this.currentToast) {
      await this.currentToast.dismiss();
    }

    this.currentToast = await this.toastController.create({
      message: action.description,
      duration: 5000,
      position: 'bottom',
      color: 'medium',
      buttons: [
        {
          text: 'Undo',
          role: 'undo',
          handler: async () => {
            const success = await this.undoService.undo(action.id);
            if (success) {
              const successToast = await this.toastController.create({
                message: 'Action undone',
                duration: 2000,
                color: 'success',
                position: 'bottom'
              });
              await successToast.present();
            }
          }
        },
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });

    await this.currentToast.present();

    // Clear when dismissed
    this.currentToast.onDidDismiss().then(() => {
      this.undoService.clearAction(action.id);
      this.currentToast = undefined;
    });
  }
}

