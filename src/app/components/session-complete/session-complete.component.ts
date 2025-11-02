import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-session-complete',
  template: `
    <ion-header>
      <ion-toolbar color="success">
        <ion-title>Session Complete! 🎉</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="session-complete-content">
      <div class="session-complete-container">
        
        <!-- Celebration Animation -->
        <div class="celebration" *ngIf="accuracy >= 80">
          <ion-icon name="trophy" class="celebration-icon"></ion-icon>
        </div>

        <!-- Summary Section -->
        <div class="summary-section">
          <h2>Great Job!</h2>
          
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value accuracy">{{ accuracy }}%</div>
              <div class="summary-label">Accuracy</div>
            </div>
            
            <div class="summary-item">
              <div class="summary-value duration">{{ formatDuration(duration) }}</div>
              <div class="summary-label">Duration</div>
            </div>
            
            <div class="summary-item">
              <div class="summary-value words">{{ wordsSpoken }}</div>
              <div class="summary-label">Words Spoken</div>
            </div>
          </div>

          <!-- Comparison with Previous -->
          <div class="comparison" *ngIf="previousAccuracy !== undefined">
            <div class="comparison-item" [class.improved]="accuracy > previousAccuracy" [class.declined]="accuracy < previousAccuracy">
              <ion-icon [name]="accuracy > previousAccuracy ? 'arrow-up' : accuracy < previousAccuracy ? 'arrow-down' : 'remove'"></ion-icon>
              <span>{{ accuracy > previousAccuracy ? 'Improved' : accuracy < previousAccuracy ? 'Declined' : 'Same' }} 
                by {{ Math.abs(accuracy - previousAccuracy) }}%</span>
            </div>
          </div>
        </div>

        <!-- Performance Message -->
        <div class="performance-message">
          <p>{{ getPerformanceMessage() }}</p>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h3>What's Next?</h3>
          <div class="action-buttons">
            <ion-button expand="block" fill="solid" color="primary" (click)="tryAgain()">
              <ion-icon name="refresh" slot="start"></ion-icon>
              Try Again
            </ion-button>
            
            <ion-button expand="block" fill="outline" color="medium" (click)="viewHistory()">
              <ion-icon name="list" slot="start"></ion-icon>
              View History
            </ion-button>
            
            <ion-button expand="block" fill="outline" color="medium" (click)="startNew()">
              <ion-icon name="add-circle" slot="start"></ion-icon>
              Start New Practice
            </ion-button>
          </div>
        </div>

      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button expand="block" fill="clear" (click)="close()">
          Close
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .session-complete-content {
      --background: var(--ion-background-color);
    }

    .session-complete-container {
      padding: 1.5rem;
      text-align: center;
    }

    .celebration {
      margin: 2rem 0;
      animation: bounce 0.6s ease-in-out;
    }

    .celebration-icon {
      font-size: 5rem;
      color: var(--ion-color-warning);
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    .summary-section {
      margin: 2rem 0;
    }

    .summary-section h2 {
      color: var(--ion-color-primary);
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-item {
      background: rgba(var(--ion-color-light-rgb), 0.5);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .summary-value {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .summary-value.accuracy {
      color: var(--ion-color-primary);
    }

    .summary-value.duration {
      color: var(--ion-color-secondary);
    }

    .summary-value.words {
      color: var(--ion-color-success);
    }

    .summary-label {
      font-size: 0.875rem;
      color: var(--ion-color-medium);
      font-weight: 500;
    }

    .comparison {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(var(--ion-color-light-rgb), 0.5);
      border-radius: 12px;
    }

    .comparison-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 600;
    }

    .comparison-item.improved {
      color: var(--ion-color-success);
    }

    .comparison-item.declined {
      color: var(--ion-color-danger);
    }

    .performance-message {
      margin: 1.5rem 0;
      padding: 1rem;
      background: rgba(var(--ion-color-primary-rgb), 0.1);
      border-radius: 12px;
      border-left: 4px solid var(--ion-color-primary);
    }

    .performance-message p {
      margin: 0;
      color: var(--ion-color-dark);
      font-size: 1rem;
      line-height: 1.6;
    }

    .next-steps {
      margin-top: 2rem;
    }

    .next-steps h3 {
      color: var(--ion-color-primary);
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .action-buttons ion-button {
      --border-radius: 12px;
      height: 48px;
      font-weight: 600;
    }
  `]
})
export class SessionCompleteComponent {
  @Input() accuracy: number = 0;
  @Input() duration: number = 0; // in seconds
  @Input() wordsSpoken: number = 0;
  @Input() previousAccuracy?: number;
  @Input() practiceType: string = '';

  Math = Math;

  constructor(private modalController: ModalController) {}

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getPerformanceMessage(): string {
    if (this.accuracy >= 90) {
      return 'Outstanding performance! Your speech was nearly perfect. Keep up the excellent work!';
    } else if (this.accuracy >= 75) {
      return 'Great job! You\'re doing very well. With a bit more practice, you\'ll reach perfection!';
    } else if (this.accuracy >= 60) {
      return 'Good progress! You\'re on the right track. Keep practicing to improve your accuracy.';
    } else {
      return 'Keep practicing! Every session makes you better. Focus on clarity and pacing.';
    }
  }

  tryAgain() {
    this.modalController.dismiss({ action: 'tryAgain' });
  }

  viewHistory() {
    this.modalController.dismiss({ action: 'viewHistory' });
  }

  startNew() {
    this.modalController.dismiss({ action: 'startNew' });
  }

  close() {
    this.modalController.dismiss();
  }
}

