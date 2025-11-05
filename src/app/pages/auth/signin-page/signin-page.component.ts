import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';

@Component({
  selector: 'app-signin-page',
  templateUrl: './signin-page.component.html',
  styleUrls: ['./signin-page.component.scss'],
})
export class SignInPageComponent implements OnInit {
  signInForm: FormGroup;
  showPassword = false;
  isLoading = false;
  emailTouched = false;
  passwordTouched = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private firebaseAuthService: FirebaseAuthService
  ) {
    this.signInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    const rememberedData = localStorage.getItem('rememberedUser');
    if (rememberedData) {
      try {
        const decoded = atob(rememberedData);
        const { email, password } = JSON.parse(decoded);
        this.signInForm.patchValue({
          email,
          password,
          rememberMe: true
        });
      } catch {
        localStorage.removeItem('rememberedUser');
      }
    }
    
    // Watch for remember me changes and update autocomplete accordingly
    this.signInForm.get('rememberMe')?.valueChanges.subscribe((rememberMe) => {
      if (!rememberMe) {
        // When remember me is unchecked, clear password and prevent browser from saving
        // The autocomplete attribute will be updated via the template binding
      }
    });
  }

  goBack() {
    this.router.navigate(['/auth/landing']);
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.signInForm.valid && !this.isLoading) {
      this.isLoading = true;

      const loading = await this.loadingController.create({
        message: 'Signing you in...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const { email, password, rememberMe } = this.signInForm.value;

        await this.firebaseAuthService.signIn(email, password);

        // ✅ Handle Remember Me for email + password
        if (rememberMe) {
          const encoded = btoa(JSON.stringify({ email, password }));
          localStorage.setItem('rememberedUser', encoded);
        } else {
          localStorage.removeItem('rememberedUser');
        }

        await loading.dismiss();
        this.isLoading = false;

        const toast = await this.toastController.create({
          message: 'Welcome back!',
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        await toast.present();

        setTimeout(() => {
          this.router.navigate(['/tabs']);
        }, 1000);

      } catch (error: any) {
        await loading.dismiss();
        this.isLoading = false;

        console.error('Sign in error:', error);

        const toast = await this.toastController.create({
          message: error.message || 'Sign in failed. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.signInForm.get(fieldName);
    if (!field) return '';

    if (field.errors && (field.touched || this.isLoading)) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  onEmailBlur() {
    this.emailTouched = true;
  }

  onPasswordBlur() {
    this.passwordTouched = true;
  }

  onEmailInput() {
    const emailField = this.signInForm.get('email');
    if (emailField && this.emailTouched) {
      emailField.updateValueAndValidity();
    }
  }

  onPasswordInput() {
    const passwordField = this.signInForm.get('password');
    if (passwordField && this.passwordTouched) {
      passwordField.updateValueAndValidity();
    }
  }

  getPasswordStrength(): { strength: string; color: string } {
    const password = this.signInForm.get('password')?.value || '';
    if (!password) return { strength: '', color: '' };

    if (password.length < 6) {
      return { strength: 'Weak', color: 'danger' };
    } else if (password.length < 8) {
      return { strength: 'Fair', color: 'warning' };
    } else if (password.length < 12) {
      return { strength: 'Good', color: 'success' };
    } else {
      return { strength: 'Strong', color: 'success' };
    }
  }

  getEmailValidationMessage(): string {
    const email = this.signInForm.get('email')?.value || '';
    if (!email) {
      return 'Email is required';
    }
    if (this.signInForm.get('email')?.hasError('email')) {
      return 'Please enter a valid email address (e.g., user@example.com)';
    }
    return '';
  }
}
