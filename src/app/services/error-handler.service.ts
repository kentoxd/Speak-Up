import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

export enum ErrorType {
  MICROPHONE_PERMISSION_DENIED = 'MICROPHONE_PERMISSION_DENIED',
  SPEECH_RECOGNITION_NOT_SUPPORTED = 'SPEECH_RECOGNITION_NOT_SUPPORTED',
  NETWORK_FAILURE = 'NETWORK_FAILURE',
  EMPTY_TRANSCRIPT = 'EMPTY_TRANSCRIPT',
  AUDIO_PLAYBACK_FAILURE = 'AUDIO_PLAYBACK_FAILURE',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  RECORDING_FAILED = 'RECORDING_FAILED',
  SAVE_FAILED = 'SAVE_FAILED',
  UNKNOWN = 'UNKNOWN'
}

export interface ErrorInfo {
  message: string;
  solution: string;
  canRetry: boolean;
  retryAction?: () => Promise<void>;
  helpLink?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private retryAttempts = new Map<string, number>();
  private readonly MAX_RETRIES = 3;

  constructor(private toastController: ToastController) {}

  /**
   * Convert an error to user-friendly message with solution
   */
  getErrorInfo(error: any, errorType?: ErrorType): ErrorInfo {
    // Try to detect error type from error object if not provided
    if (!errorType) {
      errorType = this.detectErrorType(error);
    }

    const errorInfo = this.getErrorInfoByType(errorType);
    
    // If retry action provided, wrap it with retry logic
    if (errorInfo.canRetry && errorInfo.retryAction) {
      const originalRetry = errorInfo.retryAction;
      errorInfo.retryAction = async () => {
        const errorKey = errorType || ErrorType.UNKNOWN;
        const attempts = this.retryAttempts.get(errorKey) || 0;
        
        if (attempts >= this.MAX_RETRIES) {
          await this.showError('Maximum retry attempts reached. Please try again later.');
          this.retryAttempts.delete(errorKey);
          return;
        }

        this.retryAttempts.set(errorKey, attempts + 1);
        await this.delay(1000 * Math.pow(2, attempts)); // Exponential backoff
        
        try {
          await originalRetry();
          this.retryAttempts.delete(errorKey);
        } catch (retryError) {
          // Will be handled by caller
          throw retryError;
        }
      };
    }

    return errorInfo;
  }

  /**
   * Detect error type from error object
   */
  private detectErrorType(error: any): ErrorType {
    if (!error) return ErrorType.UNKNOWN;

    const errorMessage = (error.message || error.toString() || '').toLowerCase();

    if (errorMessage.includes('permission') || errorMessage.includes('microphone') || errorMessage.includes('audio')) {
      return ErrorType.MICROPHONE_PERMISSION_DENIED;
    }

    if (errorMessage.includes('speech recognition') || errorMessage.includes('not supported')) {
      return ErrorType.SPEECH_RECOGNITION_NOT_SUPPORTED;
    }

    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
      return ErrorType.NETWORK_FAILURE;
    }

    if (errorMessage.includes('quota') || errorMessage.includes('storage')) {
      return ErrorType.STORAGE_QUOTA_EXCEEDED;
    }

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return ErrorType.MICROPHONE_PERMISSION_DENIED;
    }

    if (error.name === 'NotFoundError' || error.name === 'NotReadableError') {
      return ErrorType.RECORDING_FAILED;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Get error info by error type
   */
  private getErrorInfoByType(errorType: ErrorType): ErrorInfo {
    switch (errorType) {
      case ErrorType.MICROPHONE_PERMISSION_DENIED:
        return {
          message: 'Microphone access denied',
          solution: 'Please enable microphone permissions in your browser settings and try again.',
          canRetry: true,
          helpLink: '/faq'
        };

      case ErrorType.SPEECH_RECOGNITION_NOT_SUPPORTED:
        return {
          message: 'Voice recording not supported',
          solution: 'Your browser doesn\'t support voice recording. Please use Chrome, Edge, or Safari for the best experience.',
          canRetry: false,
          helpLink: '/faq'
        };

      case ErrorType.NETWORK_FAILURE:
        return {
          message: 'Network connection failed',
          solution: 'Please check your internet connection and try again. Your work has been saved locally.',
          canRetry: true
        };

      case ErrorType.EMPTY_TRANSCRIPT:
        return {
          message: 'No speech detected',
          solution: 'Please speak clearly into your microphone. Make sure your microphone is working and not muted. Try speaking louder or moving closer to your device.',
          canRetry: true
        };

      case ErrorType.AUDIO_PLAYBACK_FAILURE:
        return {
          message: 'Unable to play audio recording',
          solution: 'The audio format may not be supported by your browser. Speech recognition worked correctly, and you can still view your feedback.',
          canRetry: false
        };

      case ErrorType.STORAGE_QUOTA_EXCEEDED:
        return {
          message: 'Storage limit reached',
          solution: 'Please clear some old practice sessions or free up device storage and try again.',
          canRetry: true
        };

      case ErrorType.RECORDING_FAILED:
        return {
          message: 'Recording failed to start',
          solution: 'Please check your microphone connection and browser permissions. Try refreshing the page and granting microphone access.',
          canRetry: true
        };

      case ErrorType.SAVE_FAILED:
        return {
          message: 'Failed to save',
          solution: 'Your data is safe locally. Please check your internet connection and try saving again.',
          canRetry: true
        };

      default:
        return {
          message: 'Something went wrong',
          solution: 'An unexpected error occurred. Please try again. If the problem persists, contact support.',
          canRetry: true
        };
    }
  }

  /**
   * Show error toast with retry button
   */
  async showError(
    error: any,
    errorType?: ErrorType,
    retryAction?: () => Promise<void>
  ): Promise<void> {
    const errorInfo = this.getErrorInfo(error, errorType);
    
    if (retryAction) {
      errorInfo.retryAction = retryAction;
      errorInfo.canRetry = true;
    }

    const buttons: any[] = [
      {
        text: 'OK',
        role: 'cancel'
      }
    ];

    if (errorInfo.canRetry && errorInfo.retryAction) {
      buttons.unshift({
        text: 'Retry',
        handler: async () => {
          try {
            await errorInfo.retryAction!();
          } catch (retryError) {
            // Recursive call if retry fails (will be limited by MAX_RETRIES)
            await this.showError(retryError, errorType, retryAction);
          }
        }
      });
    }

    if (errorInfo.helpLink) {
      buttons.push({
        text: 'Help',
        handler: () => {
          // Navigate to help page - will need router injection if needed
          window.location.href = errorInfo.helpLink!;
        }
      });
    }

    const toast = await this.toastController.create({
      message: `${errorInfo.message}. ${errorInfo.solution}`,
      duration: errorInfo.canRetry ? 5000 : 4000,
      color: 'danger',
      position: 'top',
      buttons: buttons,
      cssClass: 'error-toast'
    });

    await toast.present();
  }

  /**
   * Show success toast
   */
  async showSuccess(message: string, duration: number = 2000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  /**
   * Show warning toast
   */
  async showWarning(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
  }

  /**
   * Show info toast
   */
  async showInfo(message: string, duration: number = 2000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'primary',
      position: 'top'
    });
    await toast.present();
  }

  /**
   * Delay helper for exponential backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset retry attempts for an error type
   */
  resetRetries(errorType?: ErrorType): void {
    if (errorType) {
      this.retryAttempts.delete(errorType);
    } else {
      this.retryAttempts.clear();
    }
  }
}

