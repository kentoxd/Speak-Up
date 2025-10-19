import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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
  rememberMe = false;
  actionCode: string = '';
  email: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private afAuth: AngularFireAuth
  ) {
    this.passwordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator.bind(this) });
  }

  ngOnInit() {
    // Get action code from URL query parameters (from Firebase email link)
    this.route.queryParams.subscribe(params => {
      this.actionCode = params['oobCode'] || '';
      
      if (!this.actionCode) {
        console.log('No actionCode in URL, redirecting to forgot password');
        this.router.navigate(['/auth/forgot-password']);
        return;
      }
      
      console.log('Password reset - actionCode from URL:', this.actionCode);
    });
  }

  goBack() {
    this.router.navigate(['/auth/signin']);
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

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isStrong = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    return !isStrong ? { weakPassword: true } : null;
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }

    return null;
  }

  getFieldError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.formatFieldName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.formatFieldName(fieldName)} must be at least ${minLength} characters`;
      }
      if (field.errors['weakPassword']) {
        return 'Password must include uppercase, lowercase, numbers, and special characters';
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  private formatFieldName(fieldName: string): string {
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');
  }

  isPasswordRequirementMet(requirement: string): boolean {
    const password = this.passwordForm.get('password')?.value || '';

    switch (requirement) {
      case 'uppercase':
        return /[A-Z]/.test(password);
      case 'lowercase':
        return /[a-z]/.test(password);
      case 'number':
        return /[0-9]/.test(password);
      case 'special':
        return /[!@#$%^&*(),.?":{}|<>]/.test(password);
      case 'length':
        return password.length >= 8;
      default:
        return false;
    }
  }

  async onSubmit() {
    if (this.passwordForm.valid && !this.isLoading && this.actionCode) {
      this.isLoading = true;

      const loading = await this.loadingController.create({
        message: 'Updating password...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const { password } = this.passwordForm.value;

        // First verify the action code is still valid
        try {
          await this.afAuth.verifyPasswordResetCode(this.actionCode);
        } catch (verifyError: any) {
          console.error('Action code verification failed:', verifyError);
          throw verifyError;
        }

        // If verification succeeds, proceed with password reset
        await this.afAuth.confirmPasswordReset(this.actionCode, password);

        await loading.dismiss();
        this.showSuccess = true;
        this.isLoading = false;

        const toast = await this.toastController.create({
          message: 'Password reset successfully!',
          duration: 3000,
          color: 'success',
          position: 'top'
        });
        await toast.present();

        setTimeout(() => {
          this.goToSignIn();
        }, 2000);

      } catch (error: any) {
        await loading.dismiss();
        this.isLoading = false;

        console.error('Password reset error:', error);
        
        let message = 'Failed to update password. Please try again.';
        
        if (error.code === 'auth/expired-action-code') {
          message = 'Password reset link has expired. Please request a new one.';
        } else if (error.code === 'auth/invalid-action-code') {
          message = 'Invalid password reset link. Please request a new one.';
        } else if (error.code === 'auth/weak-password') {
          message = 'Password is too weak. Please choose a stronger password.';
        } else if (error.code === 'auth/user-disabled') {
          message = 'This account has been disabled. Please contact support.';
        } else if (error.code === 'auth/user-not-found') {
          message = 'User account not found. Please request a new password reset.';
        }

        const toast = await this.toastController.create({
          message: message,
          duration: 4000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    } else if (!this.actionCode) {
      const toast = await this.toastController.create({
        message: 'Invalid password reset session. Please request a new password reset.',
        duration: 4000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      
      setTimeout(() => {
        this.router.navigate(['/auth/forgot-password']);
      }, 2000);
    }
  }
}