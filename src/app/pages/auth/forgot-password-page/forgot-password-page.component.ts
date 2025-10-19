import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.scss'],
})
export class ForgotPasswordPageComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private afAuth: AngularFireAuth
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  goBack() {
    this.router.navigate(['/auth/signin']);
  }

  async onSubmit() {
    if (this.forgotPasswordForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const loading = await this.loadingController.create({
        message: 'Sending password reset email...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const { email } = this.forgotPasswordForm.value;
        
        // Send Firebase password reset email
        await this.afAuth.sendPasswordResetEmail(email);
        
        await loading.dismiss();
        this.isLoading = false;

        const successToast = await this.toastController.create({
          message: 'Password reset email sent! Check your inbox. Please check your spam folder if you do not see it.',
          color: 'success',
          duration: 5000,
          position: 'top'
        });
        await successToast.present();

        // Navigate back to signin after delay
        setTimeout(() => {
          this.router.navigate(['/auth/signin']);
        }, 3000);

      } catch (error: any) {
        await loading.dismiss();
        this.isLoading = false;

        let message = 'Failed to send password reset email. Please try again.';

        if (error.code === 'auth/user-not-found') {
          message = 'No account found with this email address.';
        } else if (error.code === 'auth/invalid-email') {
          message = 'Invalid email address.';
        } else if (error.code === 'auth/too-many-requests') {
          message = 'Too many requests. Please try again later.';
        }

        const toast = await this.toastController.create({
          message: message,
          duration: 4000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.forgotPasswordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Email is required';
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }
}