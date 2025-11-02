import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-step-indicator',
  template: `
    <div class="step-indicator-container">
      <div class="step-progress">
        <div class="step-progress-bar">
          <div class="step-progress-fill" [style.width.%]="getProgressPercentage()"></div>
        </div>
      </div>
      
      <div class="steps-list">
        <div 
          *ngFor="let stepLabel of stepLabels; let i = index"
          class="step-item"
          [class.completed]="i < currentStep"
          [class.active]="i === currentStep - 1"
          [class.clickable]="allowBackNavigation && i < currentStep - 1"
          (click)="allowBackNavigation && i < currentStep - 1 && goToStep(i + 1)">
          
          <div class="step-circle">
            <ion-icon 
              *ngIf="i < currentStep - 1" 
              name="checkmark" 
              class="step-checkmark">
            </ion-icon>
            <span *ngIf="i >= currentStep - 1" class="step-number">{{ i + 1 }}</span>
          </div>
          
          <div class="step-label">{{ stepLabel }}</div>
        </div>
      </div>
      
      <div class="step-info">
        <span class="step-text">Step {{ currentStep }} of {{ totalSteps }}</span>
      </div>
    </div>
  `,
  styles: [`
    .step-indicator-container {
      padding: 1rem;
      background: rgba(var(--ion-color-light-rgb), 0.3);
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .step-progress {
      margin-bottom: 1rem;
    }

    .step-progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(var(--ion-color-medium-rgb), 0.3);
      border-radius: 2px;
      overflow: hidden;
    }

    .step-progress-fill {
      height: 100%;
      background: var(--ion-color-primary);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .steps-list {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      position: relative;
    }

    .step-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      
      &.clickable {
        cursor: pointer;
        
        .step-circle {
          transition: transform 0.2s ease;
        }
        
        &:hover .step-circle {
          transform: scale(1.1);
        }
      }
    }

    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--ion-color-light);
      border: 2px solid var(--ion-color-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;
      
      .step-number {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ion-color-medium);
      }
      
      .step-checkmark {
        font-size: 1.2rem;
        color: white;
      }
    }

    .step-item.completed .step-circle {
      background: var(--ion-color-success);
      border-color: var(--ion-color-success);
    }

    .step-item.active .step-circle {
      background: var(--ion-color-primary);
      border-color: var(--ion-color-primary);
      
      .step-number {
        color: white;
      }
    }

    .step-label {
      font-size: 0.75rem;
      text-align: center;
      color: var(--ion-color-medium);
      font-weight: 500;
      transition: color 0.3s ease;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .step-item.completed .step-label,
    .step-item.active .step-label {
      color: var(--ion-color-dark);
      font-weight: 600;
    }

    .step-info {
      text-align: center;
      margin-top: 0.5rem;
    }

    .step-text {
      font-size: 0.875rem;
      color: var(--ion-color-medium);
      font-weight: 500;
    }

    @media (max-width: 480px) {
      .step-label {
        font-size: 0.7rem;
        max-width: 60px;
      }
      
      .step-circle {
        width: 28px;
        height: 28px;
      }
    }
  `]
})
export class StepIndicatorComponent {
  @Input() totalSteps: number = 3;
  @Input() currentStep: number = 1;
  @Input() stepLabels: string[] = [];
  @Input() allowBackNavigation: boolean = true;
  
  @Output() stepChange = new EventEmitter<number>();

  getProgressPercentage(): number {
    return ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
  }

  goToStep(step: number) {
    if (this.allowBackNavigation && step < this.currentStep) {
      this.stepChange.emit(step);
    }
  }
}

