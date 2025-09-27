import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-feedback-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Practice Feedback</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="feedback-content">
      <div class="feedback-container">
        
        <!-- Main Title -->
        <h2 class="main-title">📊 Practice Feedback</h2>
        
        <!-- Overall Accuracy -->
        <div class="accuracy-section">
          <h3 class="section-title">🎯 Overall Accuracy</h3>
          <div class="accuracy-value" [class.fail]="overallColor === 'red'" [class.pass]="overallColor === 'green'">
            {{ overallAccuracy }}% {{ overallColor === 'red' ? '❌' : '✅' }}
          </div>
        </div>

        <!-- Detailed Metrics -->
        <div class="metrics-section">
          <div class="metric-item">
            <span class="metric-label">📝 Word Accuracy:</span>
            <span class="metric-value" [class.fail]="wordColor === 'red'" [class.pass]="wordColor === 'green'">
              {{ wordAccuracy.toFixed(1) }}% (70% weight) {{ wordColor === 'red' ? '❌' : '✅' }}
            </span>
          </div>
          
          <div class="metric-item">
            <span class="metric-label">📊 Punctuation Accuracy:</span>
            <span class="metric-value" [class.fail]="punctuationColor === 'red'" [class.pass]="punctuationColor === 'green'">
              {{ punctuationAccuracy.toFixed(1) }}% (30% weight) {{ punctuationColor === 'red' ? '❌' : '✅' }}
            </span>
          </div>
          
          <div class="metric-item">
            <span class="metric-label">📈 Word Count:</span>
            <span class="metric-value">You spoke {{ getWordCountText() }} words than the target.</span>
          </div>
        </div>

        <!-- Analysis Section -->
        <div class="analysis-section">
          <h3 class="section-title">💡 Analysis</h3>
          <ul class="analysis-list">
            <li class="analysis-item">
              <strong>Overall:</strong> {{ getOverallPerformanceText() }}
            </li>
            <li class="analysis-item">
              <strong>Word Recognition:</strong> {{ getWordRecognitionText() }}
            </li>
            <li class="analysis-item">
              <strong>Punctuation:</strong> {{ getPunctuationText() }}
            </li>
            <li class="analysis-item">
              <strong>Speaking Pace:</strong> {{ getSpeakingPaceText() }}
            </li>
          </ul>
        </div>

        <!-- Recommendations Section -->
        <div class="recommendations-section">
          <h3 class="section-title">🎯 Recommendations</h3>
          <ul class="recommendations-list">
            <li class="recommendation-item">Practice speaking more slowly and clearly</li>
            <li class="recommendation-item">Focus on pronunciation of difficult words</li>
            <li class="recommendation-item">Use the Listen feature to hear proper pronunciation</li>
            <li class="recommendation-item">Break down the text into smaller sections for practice</li>
            <li class="recommendation-item">{{ getFinalRecommendation() }}</li>
          </ul>
        </div>

        <!-- Target Text -->
        <div class="text-section">
          <h3 class="section-title">📚 Target Text</h3>
          <div class="text-display target-text">"{{ targetText }}"</div>
        </div>

        <!-- User Speech -->
        <div class="text-section">
          <h3 class="section-title">🗣️ Your Speech</h3>
          <div class="text-display user-speech">"{{ userSpeech }}"</div>
        </div>

      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button expand="block" (click)="dismiss()" class="close-button">
          Close
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .feedback-content {
      --background: var(--ion-background);
    }

    .feedback-container {
      padding: 1rem;
    }

    .main-title {
      text-align: center;
      color: var(--ion-color-primary);
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0 0 1.5rem 0;
    }

    .section-title {
      color: var(--ion-color-primary);
      font-size: 1.1rem;
      font-weight: 600;
      margin: 1.5rem 0 0.75rem 0;
    }

    .accuracy-section {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .accuracy-value {
      font-size: 1.5rem;
      font-weight: bold;
      padding: 0.75rem;
      border-radius: 12px;
      margin: 0.5rem 0;
    }

    .accuracy-value.fail {
      color: var(--ion-color-danger);
      background: rgba(var(--ion-color-danger-rgb), 0.1);
    }

    .accuracy-value.pass {
      color: var(--ion-color-success);
      background: rgba(var(--ion-color-success-rgb), 0.1);
    }

    .metrics-section {
      margin-bottom: 1.5rem;
    }

    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--ion-color-light);
    }

    .metric-label {
      font-weight: 500;
      color: var(--ion-color-dark);
    }

    .metric-value {
      font-weight: 600;
    }

    .metric-value.fail {
      color: var(--ion-color-danger);
    }

    .metric-value.pass {
      color: var(--ion-color-success);
    }

    .analysis-list, .recommendations-list {
      margin: 0;
      padding-left: 1.2rem;
    }

    .analysis-item, .recommendation-item {
      margin: 0.5rem 0;
      line-height: 1.5;
      color: var(--ion-color-dark);
    }

    .analysis-item strong {
      color: var(--ion-color-primary);
    }

    .text-section {
      margin-bottom: 1.5rem;
    }

    .text-display {
      background: var(--ion-color-light);
      padding: 1rem;
      border-radius: 8px;
      font-style: italic;
      border-left: 3px solid var(--ion-color-primary);
      margin: 0.5rem 0;
    }

    .close-button {
      --border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `]
})
export class FeedbackModalComponent {
  @Input() overallAccuracy: number = 0;
  @Input() wordAccuracy: number = 0;
  @Input() punctuationAccuracy: number = 0;
  @Input() wordDifference: number = 0;
  @Input() overallColor: string = 'red';
  @Input() wordColor: string = 'red';
  @Input() punctuationColor: string = 'red';
  @Input() targetText: string = '';
  @Input() userSpeech: string = '';

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  getOverallPerformanceText(): string {
    if (this.overallAccuracy < 50) return 'Needs significant improvement';
    if (this.overallAccuracy < 75) return 'Good progress, keep practicing';
    return 'Excellent performance!';
  }

  getWordRecognitionText(): string {
    if (this.wordAccuracy < 50) return 'Focus on clear pronunciation';
    if (this.wordAccuracy < 75) return 'Good word recognition, minor improvements needed';
    return 'Outstanding word accuracy!';
  }

  getPunctuationText(): string {
    if (this.punctuationAccuracy < 50) return 'Work on proper punctuation and pauses';
    if (this.punctuationAccuracy < 75) return 'Good punctuation awareness, keep practicing';
    return 'Perfect punctuation usage!';
  }

  getSpeakingPaceText(): string {
    if (Math.abs(this.wordDifference) > 5) return 'Consider adjusting your speaking pace';
    return 'Great pacing!';
  }

  getFinalRecommendation(): string {
    if (this.overallAccuracy < 50) return 'Focus on accuracy over speed';
    return 'Great work! Keep practicing to maintain this level';
  }

  getWordCountText(): string {
    if (this.wordDifference > 0) {
      return this.wordDifference + ' more';
    } else {
      return Math.abs(this.wordDifference) + ' fewer';
    }
  }
}
