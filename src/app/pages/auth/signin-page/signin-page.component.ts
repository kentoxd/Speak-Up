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
  rememberMe = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private firebaseAuthService: FirebaseAuthService
  ) {
    this.signInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.signInForm.patchValue({ email: rememberedEmail });
      this.rememberMe = true;
    }
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
        const { email, password } = this.signInForm.value;
        
        await this.firebaseAuthService.signIn(email, password);
        
        // Handle remember me
        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
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

        // Redirect to main app
        setTimeout(() => {
          this.router.navigate(['/tabs']);
        }, 1000);

      } catch (error: any) {
        await loading.dismiss();
        this.isLoading = false;

        console.log('Sign in error details:', error);
        console.log('Error message:', error.message);
        console.log('Error code:', error.code);

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
