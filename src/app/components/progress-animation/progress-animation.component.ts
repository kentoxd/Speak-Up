import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-progress-animation',
  template: `
    <div class="progress-container">
      <ion-progress-bar 
        [value]="progress / 100" 
        [color]="color"
        [class.animated]="animate">
      </ion-progress-bar>
      <div class="progress-info" *ngIf="showLabel">
        <span class="progress-label">{{ label }}</span>
        <span class="progress-value">{{ progress | number:'1.0-0' }}%</span>
      </div>
    </div>
    
    <!-- Confetti animation container -->
    <div class="confetti-container" *ngIf="showConfetti" (animationend)="onConfettiEnd()">
      <div class="confetti" *ngFor="let piece of confettiPieces; let i = index" 
           [style.left.%]="i * 10"
           [style.animation-delay.ms]="i * 50"
           [style.background]="piece.color">
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      position: relative;
    }

    ion-progress-bar {
      height: 8px;
      border-radius: 4px;
      
      &.animated {
        transition: width 0.5s ease-out;
      }
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    .progress-label {
      color: var(--ion-color-medium);
      font-weight: 500;
    }

    .progress-value {
      color: var(--ion-color-primary);
      font-weight: 600;
    }

    .confetti-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    }

    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      top: -10px;
      border-radius: 2px;
      animation: confettiFall 3s ease-out forwards;
    }

    @keyframes confettiFall {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }

    @keyframes progressFill {
      from {
        width: 0;
      }
      to {
        width: var(--target-width, 100%);
      }
    }
  `]
})
export class ProgressAnimationComponent implements OnChanges {
  @Input() progress: number = 0;
  @Input() color: string = 'primary';
  @Input() label: string = '';
  @Input() showLabel: boolean = true;
  @Input() animate: boolean = true;
  @Input() triggerConfetti: boolean = false;

  showConfetti = false;
  confettiPieces: Array<{ color: string }> = [];

  ngOnChanges(changes: SimpleChanges) {
    // Show confetti when progress reaches 100% or triggerConfetti changes to true
    if (changes['progress'] && this.progress >= 100 && !changes['progress'].previousValue) {
      this.showConfettiAnimation();
    }
    if (changes['triggerConfetti'] && this.triggerConfetti) {
      this.showConfettiAnimation();
    }
  }

  showConfettiAnimation() {
    // Generate confetti pieces
    const colors = [
      '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B'
    ];
    
    this.confettiPieces = Array(20).fill(0).map(() => ({
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    this.showConfetti = true;
  }

  onConfettiEnd() {
    this.showConfetti = false;
    this.confettiPieces = [];
  }
}

