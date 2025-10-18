import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { EmailJSService } from '../../../services/emailjs.service';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.scss'],
})
export class ForgotPasswordPageComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  isLoading = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private emailJSService: EmailJSService,
    private firebaseAuthService: FirebaseAuthService
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/auth/signin']);
  }

  async onSubmit() {
    if (this.forgotPasswordForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const loading = await this.loadingController.create({
        message: 'Verifying email...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const { email } = this.forgotPasswordForm.value;
        
        // First, check if the email exists in Firebase
        const emailExists = await this.checkEmailExists(email);
        
        if (!emailExists) {
          await loading.dismiss();
          this.isLoading = false;

          const toast = await this.toastController.create({
            message: 'No account found with this email address.',
            duration: 3000,
            color: 'warning',
            position: 'top'
          });
          await toast.present();
          return;
        }

        // Clear any existing OTP data for this email to start fresh
        this.emailJSService.clearOTP(email);
        
        // Update loading message
        loading.message = 'Sending OTP...';
        
        // Send OTP only if email exists
        await this.emailJSService.sendPasswordResetOTP(email);
        
        await loading.dismiss();
        this.isLoading = false;

        const toast = await this.toastController.create({
          message: 'OTP sent successfully! Check your email.',
          duration: 3000,
          color: 'success',
          position: 'top'
        });
        await toast.present();

        // Redirect to OTP page with email in state
        setTimeout(() => {
          this.router.navigate(['/auth/otp'], { 
            state: { email: email } 
          });
        }, 1000);

      } catch (error: any) {
        await loading.dismiss();
        this.isLoading = false;

        const toast = await this.toastController.create({
          message: error.message || 'Failed to send OTP. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    }
  }

  private async checkEmailExists(email: string): Promise<boolean> {
    try {
      // Use Firebase Auth to check if email exists
      // This will throw an error if the email doesn't exist
      await this.firebaseAuthService.sendPasswordResetEmail(email);
      return true;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return false;
      }
      // For other errors, assume email exists to avoid blocking legitimate users
      return true;
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.forgotPasswordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }
}
