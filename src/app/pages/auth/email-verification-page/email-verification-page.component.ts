import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { EmailJSService } from '../../../services/emailjs.service';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';

@Component({
  selector: 'app-email-verification-page',
  templateUrl: './email-verification-page.component.html',
  styleUrls: ['./email-verification-page.component.scss'],
})
export class EmailVerificationPageComponent implements OnInit {
  verificationForm: FormGroup;
  isLoading = false;
  userEmail = '';
  countdown = 0;
  canResend = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private emailJSService: EmailJSService,
    private firebaseAuthService: FirebaseAuthService
  ) {
    this.verificationForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit() {
    // Get email from route state or current user
    this.route.queryParams.subscribe(params => {
      this.userEmail = params['email'] || '';
    });

    // If no email in params, get from current user
    if (!this.userEmail) {
      this.firebaseAuthService.getCurrentUser().subscribe(user => {
        if (user && user.email) {
          this.userEmail = user.email;
          this.sendVerificationOTP();
        } else {
          this.router.navigate(['/auth/signin']);
        }
      });
    } else {
      this.sendVerificationOTP();
    }
  }

  async sendVerificationOTP() {
    if (!this.userEmail) return;

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Sending verification code...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.emailJSService.sendEmailVerificationOTP(this.userEmail);
      
      await loading.dismiss();
      this.isLoading = false;

      const toast = await this.toastController.create({
        message: 'Verification code sent to your email!',
        duration: 3000,
        color: 'success',
        position: 'top'
      });
      await toast.present();

      this.startCountdown();

    } catch (error: any) {
      await loading.dismiss();
      this.isLoading = false;

      const toast = await this.toastController.create({
        message: error.message || 'Failed to send verification code. Please try again.',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  async resendOTP() {
    if (!this.canResend) return;
    
    await this.sendVerificationOTP();
  }

  startCountdown() {
    this.countdown = 60;
    this.canResend = false;
    
    const timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(timer);
        this.canResend = true;
      }
    }, 1000);
  }

  async onSubmit() {
    if (this.verificationForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const loading = await this.loadingController.create({
        message: 'Verifying...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const { otp } = this.verificationForm.value;
        
        const isValid = await this.emailJSService.verifyEmailOTP(this.userEmail, otp);
        
        if (isValid) {
          await loading.dismiss();
          this.isLoading = false;

          const toast = await this.toastController.create({
            message: 'Email verified successfully!',
            duration: 3000,
            color: 'success',
            position: 'top'
          });
          await toast.present();

          // Redirect to main app
          setTimeout(() => {
            this.router.navigate(['/tabs']);
          }, 1000);

        } else {
          await loading.dismiss();
          this.isLoading = false;

          const toast = await this.toastController.create({
            message: 'Invalid verification code. Please try again.',
            duration: 3000,
            color: 'danger',
            position: 'top'
          });
          await toast.present();
        }

      } catch (error: any) {
        await loading.dismiss();
        this.isLoading = false;

        const toast = await this.toastController.create({
          message: error.message || 'Verification failed. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    }
  }

  goBack() {
    this.router.navigate(['/auth/signin']);
  }

  onOTPInput(event: any) {
    const value = event.target.value;
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    this.verificationForm.patchValue({ otp: numericValue });
    
    // Auto-submit when 6 digits are entered
    if (numericValue.length === 6) {
      this.onSubmit();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.verificationForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid 6-digit code';
      }
    }
    return '';
  }
}
