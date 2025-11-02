import { Component, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-recording-indicator',
  template: `
    <div class="recording-indicator" *ngIf="isRecording">
      <div class="indicator-content">
        <div class="pulsing-circle">
          <ion-icon name="mic" class="mic-icon"></ion-icon>
        </div>
        <div class="indicator-text">
          <div class="recording-label">Recording</div>
          <div class="recording-timer">{{ formatTime(duration) }}</div>
          <div class="word-count" *ngIf="wordCount > 0">{{ wordCount }} words</div>
        </div>
        <div class="audio-level" *ngIf="showAudioLevel">
          <div class="audio-bar" *ngFor="let bar of audioBars" [class.active]="bar"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recording-indicator {
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(var(--ion-color-danger-rgb), 0.95);
      backdrop-filter: blur(10px);
      padding: 0.75rem 1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .indicator-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      gap: 1rem;
    }

    .pulsing-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 1.5s ease-in-out infinite;
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
      }
      50% {
        transform: scale(1.1);
        box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
      }
    }

    .mic-icon {
      font-size: 1.5rem;
      color: var(--ion-color-danger);
    }

    .indicator-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      color: white;
    }

    .recording-label {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
    }

    .recording-timer {
      font-size: 1.25rem;
      font-weight: 700;
      font-family: 'Courier New', monospace;
    }

    .word-count {
      font-size: 0.75rem;
      opacity: 0.8;
    }

    .audio-level {
      display: flex;
      align-items: center;
      gap: 3px;
      height: 30px;
    }

    .audio-bar {
      width: 4px;
      height: 20px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      transition: height 0.1s ease;
      
      &.active {
        background: white;
        height: 30px;
        animation: barPulse 0.5s ease-in-out infinite;
      }
    }

    @keyframes barPulse {
      0%, 100% {
        opacity: 0.8;
      }
      50% {
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .recording-indicator {
        top: 56px;
        padding: 0.5rem 0.75rem;
      }
      
      .pulsing-circle {
        width: 32px;
        height: 32px;
      }
      
      .mic-icon {
        font-size: 1.2rem;
      }
      
      .recording-timer {
        font-size: 1rem;
      }
      
      .word-count {
        font-size: 0.7rem;
      }
      
      .audio-level {
        display: none; /* Hide on mobile to save space */
      }
    }
  `]
})
export class RecordingIndicatorComponent implements OnInit, OnDestroy {
  @Input() isRecording = false;
  @Input() duration = 0; // in seconds
  @Input() wordCount = 0;
  @Input() showAudioLevel = false;

  audioBars: boolean[] = Array(10).fill(false);
  private audioBarInterval?: ReturnType<typeof setInterval>;

  ngOnDestroy() {
    if (this.audioBarInterval) {
      clearInterval(this.audioBarInterval);
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Simulate audio level visualization (in real app, use Web Audio API)
  ngOnInit() {
    if (this.showAudioLevel && this.isRecording) {
      this.audioBarInterval = setInterval(() => {
        // Random audio levels for visualization
        this.audioBars = this.audioBars.map(() => Math.random() > 0.5);
      }, 200);
    }
  }
}

