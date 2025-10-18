import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';

@Component({
  selector: 'app-create-new-password-page',
  templateUrl: './create-new-password-page.component.html',
  styleUrls: ['./create-new-password-page.component.scss'],
})
export class CreateNewPasswordPageComponent implements OnInit {
  passwordForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  showSuccess = false;
  email: string = '';
  rememberMe = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private firebaseAuthService: FirebaseAuthService
  ) {
    this.passwordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Get email from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['email']) {
      this.email = navigation.extras.state['email'];
    } else {
      // If no email in state, redirect back to forgot password
      this.router.navigate(['/auth/forgot-password']);
      return;
    }
  }

  goBack() {
    this.router.navigate(['/auth/otp']);
  }

  goToSignIn() {
    this.router.navigate(['/auth/signin']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit() {
    if (this.passwordForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const loading = await this.loadingController.create({
        message: 'Updating password...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const { password } = this.passwordForm.value;
        
        // Update loading message
        loading.message = 'Processing password reset...';
        
        await this.firebaseAuthService.updatePasswordWithOTP(this.email, password);
        
        await loading.dismiss();
        this.isLoading = false;

        // Show success message
        const toast = await this.toastController.create({
          message: 'Password reset email sent! Check your email and follow the link to set your new password.',
          duration: 5000,
          color: 'success',
          position: 'top'
        });
        await toast.present();

        // Show success state
        this.showSuccess = true;

        // Auto-redirect to sign in after 5 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/signin']);
        }, 5000);

      } catch (error: any) {
        await loading.dismiss();
        this.isLoading = false;

        const toast = await this.toastController.create({
          message: error.message || 'Failed to send password reset link. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  getFieldError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }
}
