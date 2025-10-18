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
  otpCode: string = '';
  email: string = '';
  verificationType: string = 'password-reset';
  isLoading = false;
  countdownTimer = 60;
  canResend = false;
  showSuccessModal = false;
  confettiPieces: number[] = [];
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

  generateConfetti() {
    this.confettiPieces = Array.from({ length: 20 }, (_, i) => i);
  }

  goBack() {
    if (this.verificationType === 'verification') {
      this.router.navigate(['/auth/register']);
    } else {
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  onOTPInput(event: any) {
    let value = event.target.value;

    // Only allow digits
    value = value.replace(/\D/g, '');

    // Max 6 digits
    if (value.length > 6) {
      value = value.slice(0, 6);
    }

    this.otpCode = value;
    event.target.value = value;

    // Auto-submit when 6 digits entered
    if (value.length === 6 && !this.isLoading) {
      setTimeout(() => this.onSubmit(), 300);
    }
  }

  onOTPKeyDown(event: KeyboardEvent) {
    const key = event.key;

    // Allow only digits and control keys
    if (!/^\d$/.test(key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    const pastedData = event.clipboardData?.getData('text') || '';
    let digits = pastedData.replace(/\D/g, '').slice(0, 6);

    if (digits.length === 0) return;

    this.otpCode = digits;
    const input = event.target as HTMLInputElement;
    input.value = digits;

    // Auto-submit if 6 digits pasted
    if (digits.length === 6 && !this.isLoading) {
      setTimeout(() => this.onSubmit(), 200);
    }
  }

  async onSubmit() {
    if (this.isLoading) {
      return;
    }

    if (this.otpCode.length !== 6) {
      const toast = await this.toastController.create({
        message: 'Please enter a 6-digit OTP',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;

    const loading = await this.loadingController.create({
      message: 'Verifying OTP...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      let isValid = false;

      if (this.verificationType === 'verification') {
        isValid = await this.emailJSService.verifyEmailOTP(this.email, this.otpCode);
      } else {
        isValid = this.emailJSService.validateOTP(this.email, this.otpCode);
      }

      await loading.dismiss();

      if (isValid) {
        if (this.verificationType === 'verification') {
          this.showSuccessModal = true;
          this.generateConfetti();

          setTimeout(() => {
            this.router.navigate(['/auth/signin']);
          }, 3000);
        } else {
          const toast = await this.toastController.create({
            message: 'OTP verified successfully!',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          await toast.present();

          setTimeout(() => {
            const navigationExtras: NavigationExtras = {
              state: { email: this.email }
            };
            this.router.navigate(['/auth/create-password'], navigationExtras);
          }, 1000);
        }
      } else {
        const toast = await this.toastController.create({
          message: 'Invalid OTP. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
        this.otpCode = '';
      }

      this.isLoading = false;

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

      this.otpCode = '';
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
        this.otpCode = '';
        this.startCountdown();

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