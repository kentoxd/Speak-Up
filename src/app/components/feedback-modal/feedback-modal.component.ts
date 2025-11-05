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
          </ul>
        </div>

        <!-- Filler Words Analysis Section -->
        <div class="filler-words-section" *ngIf="fillerAnalysis">
          <h3 class="section-title">🗣️ Filler Words Analysis</h3>
          
          <div class="stat-card">
            <span class="label">Filler Words Found</span>
            <span class="value">{{ fillerAnalysis.fillerCount }}</span>
          </div>
          
          <div class="stat-card">
            <span class="label">Percentage of Speech</span>
            <span class="value">{{ fillerAnalysis.fillerPercentage }}%</span>
          </div>
          
          <div class="feedback-text" [ngClass]="getFeedbackClass(fillerAnalysis.fillerPercentage)">
            {{ fillerAnalysis.fillerFeedback }}
          </div>
          
          <div class="breakdown" *ngIf="fillerAnalysis.fillerBreakdown.length > 0">
            <p class="label">Breakdown:</p>
            <div *ngFor="let item of fillerAnalysis.fillerBreakdown" class="breakdown-item">
              {{ item }}
            </div>
          </div>
        </div>

        <!-- Clarity Analysis Section -->
        <div class="clarity-section" *ngIf="clarityAnalysis">
          <h3 class="section-title">🎯 Clarity Analysis</h3>
          
          <div class="clarity-score">
            <div class="score-circle" [ngClass]="getClarityClass(clarityAnalysis.clarityScore)">
              <span class="score-value">{{ clarityAnalysis.clarityScore }}</span>
              <span class="score-label">/ 100</span>
            </div>
          </div>
          
          <div class="metric-breakdown">
            <div class="metric" *ngFor="let metric of getMetrics(clarityAnalysis.breakdown)">
              <span class="metric-name">{{ metric.name }}</span>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="metric.value"></div>
              </div>
              <span class="metric-value">{{ metric.value }}%</span>
            </div>
          </div>
          
          <div class="feedback-items">
            <div *ngFor="let feedback of clarityAnalysis.feedbackArray" class="feedback-item">
              <ion-icon name="checkmark-circle-outline"></ion-icon>
              <span>{{ feedback }}</span>
            </div>
          </div>
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
          <div class="text-display user-speech">
            <span *ngFor="let word of getHighlightedWords(); let i = index">
              <span 
                [class.word-correct]="word.type === 'correct'"
                [class.word-wrong]="word.type === 'wrong'"
                [class.word-added]="word.type === 'added'"
                [class.word-missing]="word.type === 'missing'"
                [attr.title]="getWordTooltip(word)">
                {{ word.text }}
              </span><span *ngIf="i < getHighlightedWords().length - 1">&nbsp;</span>
            </span>
          </div>
          <div class="word-legend" *ngIf="hasDifferences()">
            <div class="legend-item">
              <span class="legend-color correct"></span>
              <span>Correct word</span>
            </div>
            <div class="legend-item">
              <span class="legend-color wrong"></span>
              <span>Wrong word</span>
            </div>
            <div class="legend-item">
              <span class="legend-color added"></span>
              <span>Extra word (not in target)</span>
            </div>
            <div class="legend-item">
              <span class="legend-color missing"></span>
              <span>Missing word (should be here)</span>
            </div>
          </div>
        </div>

      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" (click)="dismiss()">
            <ion-icon name="close" slot="start"></ion-icon>
            Close
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="addToHistory()">
            <ion-icon name="bookmark" slot="start"></ion-icon>
            Add to History
          </ion-button>
        </ion-buttons>
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
      line-height: 1.8;
      word-wrap: break-word;
    }

    .word-correct {
      background-color: #d4edda;
      color: #155724;
      padding: 2px 4px;
      border-radius: 3px;
    }

    .word-wrong {
      background-color: #f8d7da;
      color: #721c24;
      padding: 2px 4px;
      border-radius: 3px;
      text-decoration: line-through;
      font-weight: 600;
    }

    .word-added {
      background-color: #fff3cd;
      color: #856404;
      padding: 2px 4px;
      border-radius: 3px;
      font-weight: 600;
      border: 1px solid #ffc107;
    }

    .word-missing {
      background-color: #e2e3e5;
      color: #383d41;
      padding: 2px 4px;
      border-radius: 3px;
      font-style: italic;
      text-decoration: underline;
      border: 1px dashed #6c757d;
    }

    .word-legend {
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: #f8f9fa;
      border-radius: 6px;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.875rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 3px;
      display: inline-block;
    }

    .legend-color.correct {
      background-color: #d4edda;
      border: 1px solid #28a745;
    }

    .legend-color.wrong {
      background-color: #f8d7da;
      border: 1px solid #dc3545;
    }

    .legend-color.added {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
    }

    .legend-color.missing {
      background-color: #e2e3e5;
      border: 1px dashed #6c757d;
    }

    .close-button {
      --border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filler-words-section {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 8px;
      
      h3 {
        margin-top: 0;
        color: #333;
      }
      
      .stat-card {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #ddd;
        
        .label {
          font-size: 14px;
          color: #666;
        }
        
        .value {
          font-weight: bold;
          font-size: 16px;
          color: #333;
        }
      }
      
      .feedback-text {
        margin: 15px 0;
        padding: 12px;
        border-left: 4px solid #ffc107;
        border-radius: 4px;
        font-size: 14px;
        
        &.excellent {
          border-left-color: #28a745;
          background-color: #d4edda;
        }
        
        &.good {
          border-left-color: #ffc107;
          background-color: #fff3cd;
        }
        
        &.warning {
          border-left-color: #dc3545;
          background-color: #f8d7da;
        }
      }
      
      .breakdown {
        margin-top: 12px;
        font-size: 13px;
        
        .label {
          font-weight: bold;
          color: #666;
          margin-bottom: 8px;
        }
        
        .breakdown-item {
          padding: 5px 0;
          color: #555;
        }
      }
    }

    .clarity-section {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 8px;
      
      h3 {
        margin-top: 0;
        color: #333;
      }
      
      .clarity-score {
        display: flex;
        justify-content: center;
        margin: 20px 0;
        
        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          color: white;
          
          &.excellent {
            background-color: #28a745;
          }
          
          &.good {
            background-color: #ffc107;
          }
          
          &.poor {
            background-color: #dc3545;
          }
          
          .score-value {
            font-size: 36px;
            line-height: 1;
          }
          
          .score-label {
            font-size: 14px;
            opacity: 0.9;
          }
        }
      }
      
      .metric-breakdown {
        margin: 20px 0;
        
        .metric {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          
          .metric-name {
            min-width: 80px;
            font-size: 13px;
            font-weight: 500;
            color: #666;
          }
          
          .progress-bar {
            flex: 1;
            height: 8px;
            background-color: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            
            .progress-fill {
              height: 100%;
              background-color: #007bff;
              transition: width 0.3s ease;
            }
          }
          
          .metric-value {
            min-width: 30px;
            text-align: right;
            font-size: 13px;
            font-weight: bold;
            color: #333;
          }
        }
      }
      
      .feedback-items {
        margin-top: 15px;
        
        .feedback-item {
          display: flex;
          gap: 10px;
          padding: 8px 0;
          font-size: 13px;
          color: #555;
          
          ion-icon {
            min-width: 20px;
            color: #28a745;
          }
        }
      }
    }

    ion-footer {
      ion-toolbar {
        --padding-start: 8px;
        --padding-end: 8px;
      }

      ion-button {
        --border-radius: 8px;
        font-weight: 500;
        text-transform: none;
        margin: 4px;
      }
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
  @Input() analysis: any = null; // ADD THIS
  @Input() practiceType: string = ''; // ADD THIS
  @Input() difficulty: string = ''; // ADD THIS
  @Input() fillerAnalysis: {
    fillerCount: number;
    fillerPercentage: number;
    fillerBreakdown: string[];
    fillerFeedback: string;
  } | null = null;
  @Input() clarityAnalysis: {
    clarityScore: number;
    breakdown: { accuracy: number; pace: number; repetition: number; rhythm: number };
    feedbackArray: string[];
  } | null = null;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  // ADD THIS NEW METHOD
  async addToHistory() {
    await this.modalController.dismiss({
      action: 'addToHistory',
      sessionData: {
        transcript: this.userSpeech,
        targetText: this.targetText,
        overallAccuracy: this.overallAccuracy,
        wordAccuracy: this.wordAccuracy,
        punctuationAccuracy: this.punctuationAccuracy,
        analysis: this.analysis,
        fillerAnalysis: this.fillerAnalysis,
        clarityAnalysis: this.clarityAnalysis,
        practiceType: this.practiceType,
        difficulty: this.difficulty,
        timestamp: new Date().toISOString()
      }
    });
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

  getFeedbackClass(percentage: number): string {
    if (percentage === 0) return 'excellent';
    if (percentage >= 5) return 'warning';
    return 'good';
  }

  getClarityClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'poor';
  }

  getMetrics(breakdown: any) {
    return [
      { name: 'Accuracy', value: breakdown.accuracy },
      { name: 'Repetition', value: breakdown.repetition }
    ];
  }

  // ... rest of your existing methods remain the same ...
  private normalizeWord(word: string): string {
    return word.toLowerCase().replace(/[.,!?;:]/g, '').trim();
  }

  private normalizeWordForComparison(word: string): string {
    return word.toLowerCase().replace(/[.,!?;:\-]/g, '').trim();
  }

  private splitIntoWords(text: string): string[] {
    if (!text) return [];
    return text.trim().split(/\s+/).filter(w => w.length > 0);
  }

  private tryCombinedMatch(targetWord: string, userWords: string[], startIndex: number, maxCombine: number = 3): number {
    const targetNormalized = this.normalizeWordForComparison(targetWord);
    
    for (let combineCount = 1; combineCount <= maxCombine && startIndex + combineCount <= userWords.length; combineCount++) {
      const combined = userWords.slice(startIndex, startIndex + combineCount)
        .map(w => this.normalizeWordForComparison(w))
        .join('');
      
      if (combined === targetNormalized) {
        return combineCount;
      }
    }
    
    return 0;
  }

  private isHyphenatedWord(word: string): boolean {
    return word.includes('-');
  }

  private getHyphenatedParts(word: string): string[] {
    return word.split('-').filter(part => part.length > 0);
  }

  getHighlightedWords(): Array<{text: string, type: 'correct' | 'wrong' | 'added' | 'missing'}> {
    if (!this.targetText || !this.userSpeech) {
      const userWords = this.splitIntoWords(this.userSpeech);
      return userWords.map(word => ({ text: word, type: 'added' as const }));
    }

    const targetWords = this.splitIntoWords(this.targetText);
    const userWords = this.splitIntoWords(this.userSpeech);
    const result: Array<{text: string, type: 'correct' | 'wrong' | 'added' | 'missing'}> = [];

    let targetIndex = 0;
    let userIndex = 0;

    while (targetIndex < targetWords.length || userIndex < userWords.length) {
      if (targetIndex >= targetWords.length) {
        result.push({ text: userWords[userIndex], type: 'added' });
        userIndex++;
      } else if (userIndex >= userWords.length) {
        result.push({ text: `[${targetWords[targetIndex]}]`, type: 'missing' });
        targetIndex++;
      } else {
        const targetWord = targetWords[targetIndex];
        const targetNormalized = this.normalizeWordForComparison(targetWord);
        const userNormalized = this.normalizeWordForComparison(userWords[userIndex]);

        if (targetNormalized === userNormalized) {
          result.push({ text: userWords[userIndex], type: 'correct' });
          targetIndex++;
          userIndex++;
        } else {
          const combinedMatchCount = this.tryCombinedMatch(targetWord, userWords, userIndex, 3);
          
          if (combinedMatchCount > 0) {
            for (let i = 0; i < combinedMatchCount; i++) {
              result.push({ text: userWords[userIndex + i], type: 'correct' });
            }
            userIndex += combinedMatchCount;
            targetIndex++;
          } else if (this.isHyphenatedWord(targetWord)) {
            const hyphenatedParts = this.getHyphenatedParts(targetWord);
            const combinedParts = hyphenatedParts.map(p => this.normalizeWordForComparison(p)).join('');
            
            const hyphenatedMatchCount = this.tryCombinedMatch(combinedParts, userWords, userIndex, 3);
            
            if (hyphenatedMatchCount > 0) {
              for (let i = 0; i < hyphenatedMatchCount; i++) {
                result.push({ text: userWords[userIndex + i], type: 'correct' });
              }
              userIndex += hyphenatedMatchCount;
              targetIndex++;
            } else {
              let partMatchFound = false;
              let partsMatched = 0;
              
              for (let partIndex = 0; partIndex < hyphenatedParts.length; partIndex++) {
                const partNormalized = this.normalizeWordForComparison(hyphenatedParts[partIndex]);
                const currentUserNormalized = this.normalizeWordForComparison(userWords[userIndex + partsMatched]);
                
                if (partNormalized === currentUserNormalized) {
                  result.push({ text: userWords[userIndex + partsMatched], type: 'correct' });
                  partsMatched++;
                  partMatchFound = true;
                } else {
                  break;
                }
              }
              
              if (partMatchFound && partsMatched === hyphenatedParts.length) {
                userIndex += partsMatched;
                targetIndex++;
              } else {
                const matchResult = this.handleNoMatch(targetWords, userWords, targetIndex, userIndex, result);
                targetIndex = matchResult.newTargetIndex;
                userIndex = matchResult.newUserIndex;
              }
            }
          } else {
            const matchResult = this.handleNoMatch(targetWords, userWords, targetIndex, userIndex, result);
            targetIndex = matchResult.newTargetIndex;
            userIndex = matchResult.newUserIndex;
          }
        }
      }
    }

    return result;
  }
  
  private handleNoMatch(
    targetWords: string[],
    userWords: string[],
    targetIndex: number,
    userIndex: number,
    result: Array<{text: string, type: 'correct' | 'wrong' | 'added' | 'missing'}>
  ): { foundMatch: boolean; newTargetIndex: number; newUserIndex: number } {
    const maxLookAhead = 3;
    for (let lookAhead = 1; lookAhead <= maxLookAhead && userIndex + lookAhead < userWords.length; lookAhead++) {
      const targetNormalized = this.normalizeWordForComparison(targetWords[targetIndex]);
      const aheadNormalized = this.normalizeWordForComparison(userWords[userIndex + lookAhead]);
      
      if (targetNormalized === aheadNormalized) {
        for (let i = 0; i < lookAhead; i++) {
          result.push({ text: userWords[userIndex + i], type: 'added' });
        }
        result.push({ text: userWords[userIndex + lookAhead], type: 'correct' });
        return {
          foundMatch: true,
          newTargetIndex: targetIndex + 1,
          newUserIndex: userIndex + lookAhead + 1
        };
      }
      
      const combinedMatch = this.tryCombinedMatch(targetWords[targetIndex], userWords, userIndex + lookAhead, 2);
      if (combinedMatch > 0) {
        for (let i = 0; i < lookAhead; i++) {
          result.push({ text: userWords[userIndex + i], type: 'added' });
        }
        for (let i = 0; i < combinedMatch; i++) {
          result.push({ text: userWords[userIndex + lookAhead + i], type: 'correct' });
        }
        return {
          foundMatch: true,
          newTargetIndex: targetIndex + 1,
          newUserIndex: userIndex + lookAhead + combinedMatch
        };
      }
    }

    const maxTargetAhead = 3;
    for (let targetAhead = 1; targetAhead <= maxTargetAhead && targetIndex + targetAhead < targetWords.length; targetAhead++) {
      const targetAheadNormalized = this.normalizeWordForComparison(targetWords[targetIndex + targetAhead]);
      const userNormalized = this.normalizeWordForComparison(userWords[userIndex]);
      
      if (targetAheadNormalized === userNormalized) {
        result.push({ text: userWords[userIndex], type: 'wrong' });
        for (let i = 0; i < targetAhead; i++) {
          result.push({ text: `[${targetWords[targetIndex + i]}]`, type: 'missing' });
        }
        return {
          foundMatch: true,
          newTargetIndex: targetIndex + targetAhead + 1,
          newUserIndex: userIndex + 1
        };
      }
    }
    
    result.push({ text: userWords[userIndex], type: 'wrong' });
    return {
      foundMatch: false,
      newTargetIndex: targetIndex + 1,
      newUserIndex: userIndex + 1
    };
  }

  hasDifferences(): boolean {
    const words = this.getHighlightedWords();
    return words.some(word => word.type !== 'correct');
  }

  getWordTooltip(word: {text: string, type: string}): string {
    switch (word.type) {
      case 'correct':
        return 'Correct word';
      case 'wrong':
        return 'Incorrect word - does not match target';
      case 'added':
        return 'Extra word - not in target text';
      case 'missing':
        return 'Missing word - should be in your speech';
      default:
        return '';
    }
  }
}