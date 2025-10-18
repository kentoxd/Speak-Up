import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { EmailJSService } from '../../../services/emailjs.service';

@Component({
  selector: 'app-otp-page',
  templateUrl: './otp-page.component.html',
  styleUrls: ['./otp-page.component.scss'],
})
export class OTPPageComponent implements OnInit, OnDestroy {
  otpInputs: string[] = ['', '', '', '', '', ''];
  email: string = '';
  verificationType: string = 'password-reset';
  isLoading = false;
  countdownTimer = 60;
  canResend = false;
  private countdownInterval: any;

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private emailJSService: EmailJSService
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['email']) {
      this.email = navigation.extras.state['email'];
      this.verificationType = navigation.extras.state['type'] || 'password-reset';
    } else {
      if (this.verificationType === 'verification') {
        this.router.navigate(['/auth/register']);
      } else {
        this.router.navigate(['/auth/forgot-password']);
      }
      return;
    }

    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  goBack() {
    if (this.verificationType === 'verification') {
      this.router.navigate(['/auth/register']);
    } else {
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  private inputLock = false;

  onOTPInput(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1); // one digit only
  
    this.otpInputs[index] = value;
    input.value = value; // sync immediately
  
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  
    if (this.isOTPComplete()) {
      setTimeout(() => this.onSubmit(), 200);
    }
  }
  
  

  onOTPKeyDown(event: KeyboardEvent, index: number) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;

    // Handle backspace - clear current and move to previous
    if (key === 'Backspace') {
      event.preventDefault();
      this.otpInputs[index] = '';
      inputElement.value = '';

      if (index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          prevInput.setSelectionRange(0, 1);
        }
      }
      return;
    }

    // Handle arrow keys for navigation
    if (key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
      return;
    }

    if (key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
      return;
    }

    // Only allow digits
    if (!/^\d$/.test(key) && !['Tab', 'Shift'].includes(key)) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    if (digits.length === 0) return;

    // Fill inputs with pasted digits
    for (let i = 0; i < digits.length && i < 6; i++) {
      this.otpInputs[i] = digits[i];
      const inputElement = document.getElementById(`otp-${i}`) as HTMLInputElement;
      if (inputElement) {
        inputElement.value = digits[i];
      }
    }

    // Focus last input or next empty input
    const focusIndex = Math.min(digits.length - 1, 5);
    const focusInput = document.getElementById(`otp-${focusIndex}`) as HTMLInputElement;
    if (focusInput) {
      focusInput.focus();
    }

    // Auto-submit if 6 digits pasted
    if (digits.length === 6) {
      setTimeout(() => {
        this.onSubmit();
      }, 100);
    }
  }

  async onSubmit() {
    const otpCode = this.otpInputs.join('');

    if (!this.isOTPComplete()) {
      const toast = await this.toastController.create({
        message: 'Please enter the complete 6-digit OTP',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    if (!this.isLoading) {
      this.isLoading = true;

      const loading = await this.loadingController.create({
        message: 'Verifying OTP...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        let isValid = false;

        if (this.verificationType === 'verification') {
          isValid = await this.emailJSService.verifyEmailOTP(this.email, otpCode);
        } else {
          isValid = this.emailJSService.validateOTP(this.email, otpCode);
        }

        await loading.dismiss();
        this.isLoading = false;

        if (isValid) {
          const toast = await this.toastController.create({
            message: this.verificationType === 'verification' ?
              'Email verified successfully! You can now sign in.' :
              'OTP verified successfully!',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          await toast.present();

          setTimeout(() => {
            if (this.verificationType === 'verification') {
              this.router.navigate(['/auth/signin']);
            } else {
              const navigationExtras: NavigationExtras = {
                state: { email: this.email }
              };
              this.router.navigate(['/auth/create-password'], navigationExtras);
            }
          }, 1000);
        }

      } catch (error: any) {
        await loading.dismiss();
        this.isLoading = false;

        const toast = await this.toastController.create({
          message: error.message || 'Invalid OTP. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();

        this.clearOTPInputs();
      }
    }
  }

  isOTPComplete(): boolean {
    return this.otpInputs.every(digit => digit !== '') && this.otpInputs.length === 6;
  }

  private clearOTPInputs() {
    this.otpInputs = ['', '', '', '', '', ''];
    for (let i = 0; i < 6; i++) {
      const inputElement = document.getElementById(`otp-${i}`) as HTMLInputElement;
      if (inputElement) {
        inputElement.value = '';
      }
    }
    const firstInput = document.getElementById('otp-0') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }

  async resendOTP() {
    if (this.canResend && !this.isLoading) {
      this.isLoading = true;

      const loading = await this.loadingController.create({
        message: 'Resending OTP...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        if (this.verificationType === 'verification') {
          await this.emailJSService.sendEmailVerificationOTP(this.email);
        } else {
          await this.emailJSService.resendPasswordOTP(this.email);
        }

        await loading.dismiss();
        this.isLoading = false;

        const toast = await this.toastController.create({
          message: 'OTP resent successfully!',
          duration: 3000,
          color: 'success',
          position: 'top'
        });
        await toast.present();

        this.countdownTimer = 60;
        this.canResend = false;
        this.startCountdown();

        this.clearOTPInputs();

      } catch (error: any) {
        await loading.dismiss();
        this.isLoading = false;

        const toast = await this.toastController.create({
          message: error.message || 'Failed to resend OTP. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    }
  }

  private startCountdown() {
    this.countdownInterval = setInterval(() => {
      this.countdownTimer--;

      if (this.countdownTimer <= 0) {
        this.canResend = true;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }
}