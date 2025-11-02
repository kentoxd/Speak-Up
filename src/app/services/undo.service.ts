import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export enum UndoActionType {
  DELETE_CUSTOM_TEXT = 'DELETE_CUSTOM_TEXT',
  CLEAR_SPEECH = 'CLEAR_SPEECH',
  END_SESSION = 'END_SESSION',
  UPDATE_PROFILE = 'UPDATE_PROFILE'
}

export interface UndoableAction {
  id: string;
  type: UndoActionType;
  data: any; // Data needed to reverse the action
  timestamp: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class UndoService {
  private actionHistory: UndoableAction[] = [];
  private readonly MAX_HISTORY = 10;
  private readonly UNDO_TIMEOUT = 5000; // 5 seconds
  private undoTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  
  private undoAvailableSubject = new Subject<UndoableAction | null>();
  public undoAvailable$: Observable<UndoableAction | null> = this.undoAvailableSubject.asObservable();

  /**
   * Register an undoable action
   */
  registerAction(
    type: UndoActionType,
    data: any,
    description: string,
    undoCallback: (data: any) => Promise<void>
  ): string {
    const actionId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const action: UndoableAction = {
      id: actionId,
      type,
      data: { ...data, undoCallback }, // Store callback with data
      timestamp: Date.now(),
      description
    };

    // Add to history (keep only last MAX_HISTORY)
    this.actionHistory.unshift(action);
    if (this.actionHistory.length > this.MAX_HISTORY) {
      this.actionHistory.pop();
    }

    // Notify that undo is available
    this.undoAvailableSubject.next(action);

    // Set timeout to auto-remove after UNDO_TIMEOUT
    const timeout = setTimeout(() => {
      this.clearAction(actionId);
    }, this.UNDO_TIMEOUT);

    this.undoTimeouts.set(actionId, timeout);

    return actionId;
  }

  /**
   * Undo the last action or specific action
   */
  async undo(actionId?: string): Promise<boolean> {
    const actionToUndo = actionId 
      ? this.actionHistory.find(a => a.id === actionId)
      : this.actionHistory[0];

    if (!actionToUndo) {
      return false;
    }

    try {
      // Call the undo callback
      if (actionToUndo.data.undoCallback) {
        await actionToUndo.data.undoCallback(actionToUndo.data);
      }

      // Remove from history
      this.clearAction(actionToUndo.id);

      return true;
    } catch (error) {
      console.error('Error undoing action:', error);
      return false;
    }
  }

  /**
   * Clear a specific action from history
   */
  clearAction(actionId: string): void {
    const index = this.actionHistory.findIndex(a => a.id === actionId);
    if (index !== -1) {
      this.actionHistory.splice(index, 1);
    }

    // Clear timeout
    const timeout = this.undoTimeouts.get(actionId);
    if (timeout) {
      clearTimeout(timeout);
      this.undoTimeouts.delete(actionId);
    }

    // Update availability
    const nextAction = this.actionHistory.length > 0 ? this.actionHistory[0] : null;
    this.undoAvailableSubject.next(nextAction);
  }

  /**
   * Get the last undoable action
   */
  getLastAction(): UndoableAction | null {
    return this.actionHistory.length > 0 ? this.actionHistory[0] : null;
  }

  /**
   * Get all actions in history
   */
  getActionHistory(): UndoableAction[] {
    return [...this.actionHistory];
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    // Clear all timeouts
    this.undoTimeouts.forEach(timeout => clearTimeout(timeout));
    this.undoTimeouts.clear();

    this.actionHistory = [];
    this.undoAvailableSubject.next(null);
  }

  /**
   * Extend timeout for an action
   */
  extendTimeout(actionId: string, additionalMs: number = 5000): void {
    const timeout = this.undoTimeouts.get(actionId);
    if (timeout) {
      clearTimeout(timeout);
      
      const newTimeout = setTimeout(() => {
        this.clearAction(actionId);
      }, this.UNDO_TIMEOUT + additionalMs);
      
      this.undoTimeouts.set(actionId, newTimeout);
    }
  }
}

