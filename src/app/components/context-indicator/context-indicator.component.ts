import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-context-indicator',
  template: `
    <div class="context-indicator" *ngIf="isVisible">
      <ion-card class="context-card">
        <ion-card-content>
          <div class="context-content">
            <div class="context-main">
              <ion-icon [name]="icon" [color]="iconColor"></ion-icon>
              <div class="context-text">
                <span class="context-label">{{ label }}</span>
                <span class="context-value" *ngIf="value">{{ value }}</span>
              </div>
            </div>
            <div class="context-secondary" *ngIf="secondaryText">
              <small>{{ secondaryText }}</small>
            </div>
          </div>
        </ion-card-content>
      </ion-card>
    </div>
  `,
  styles: [`
    .context-indicator {
      position: sticky;
      top: 0;
      z-index: 10;
      margin-bottom: 1rem;
      animation: slideDown 0.3s ease-out;
    }

    .context-card {
      margin: 0;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      --background: rgba(var(--ion-color-primary-rgb), 0.1);
      border-left: 4px solid var(--ion-color-primary);
    }

    .context-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .context-main {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .context-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .context-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--ion-color-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .context-value {
      font-size: 1rem;
      font-weight: 600;
      color: var(--ion-color-primary);
    }

    .context-secondary {
      text-align: right;
      
      small {
        font-size: 0.75rem;
        color: var(--ion-color-medium);
      }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class ContextIndicatorComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() label = '';
  @Input() value = '';
  @Input() secondaryText = '';
  @Input() icon = 'information-circle';
  @Input() iconColor = 'primary';

  ngOnChanges(changes: SimpleChanges) {
    // Auto-hide if no label
    if (changes['label'] && !this.label) {
      this.isVisible = false;
    }
  }
}

