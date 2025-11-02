import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PracticeState {
  practiceType?: string;
  difficulty?: string;
  customText?: {
    name: string;
    text: string;
  };
  targetText?: string;
  isActive: boolean;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class PracticeStateService {
  private stateSubject = new BehaviorSubject<PracticeState | null>(null);
  public state$: Observable<PracticeState | null> = this.stateSubject.asObservable();

  constructor() {
    // Load saved state from localStorage on init
    this.loadState();
  }

  /**
   * Save practice state
   */
  saveState(state: Partial<PracticeState>): void {
    const currentState = this.stateSubject.value || {
      isActive: false,
      timestamp: Date.now()
    };

    const newState: PracticeState = {
      ...currentState,
      ...state,
      timestamp: Date.now()
    };

    this.stateSubject.next(newState);
    
    // Persist to localStorage
    try {
      localStorage.setItem('practiceState', JSON.stringify(newState));
    } catch (error) {
      console.warn('Failed to save practice state to localStorage:', error);
    }
  }

  /**
   * Get current state
   */
  getState(): PracticeState | null {
    return this.stateSubject.value;
  }

  /**
   * Load state from localStorage
   */
  private loadState(): void {
    try {
      const saved = localStorage.getItem('practiceState');
      if (saved) {
        const state = JSON.parse(saved);
        // Only restore if state is less than 1 hour old
        const age = Date.now() - (state.timestamp || 0);
        if (age < 3600000) { // 1 hour
          this.stateSubject.next(state);
        } else {
          this.clearState();
        }
      }
    } catch (error) {
      console.warn('Failed to load practice state from localStorage:', error);
    }
  }

  /**
   * Clear practice state
   */
  clearState(): void {
    this.stateSubject.next(null);
    try {
      localStorage.removeItem('practiceState');
    } catch (error) {
      console.warn('Failed to clear practice state from localStorage:', error);
    }
  }

  /**
   * Update state when practice changes
   */
  updatePracticeSetup(practiceType: string, difficulty: string): void {
    this.saveState({
      practiceType,
      difficulty,
      isActive: true
    });
  }

  /**
   * Update state when custom text is set
   */
  updateCustomText(name: string, text: string): void {
    this.saveState({
      customText: { name, text },
      targetText: text,
      isActive: true
    });
  }

  /**
   * Check if there's a resumable practice
   */
  hasResumablePractice(): boolean {
    const state = this.stateSubject.value;
    return state?.isActive === true && !!state.timestamp;
  }
}

