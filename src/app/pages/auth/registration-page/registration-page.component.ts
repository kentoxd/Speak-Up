import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { EmailJSService } from '../../../services/emailjs.service';

@Component({
  selector: 'app-registration-page',
  templateUrl: './registration-page.component.html',
  styleUrls: ['./registration-page.component.scss'],
})
export class RegistrationPageComponent implements OnInit {
  registrationForm: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private firebaseAuthService: FirebaseAuthService,
    private emailJSService: EmailJSService
  ) {
    this.registrationForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/auth/landing']);
  }

  goToSignIn() {
    this.router.navigate(['/auth/signin']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.registrationForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const loading = await this.loadingController.create({
        message: 'Creating your account...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const { firstName, lastName, email, password } = this.registrationForm.value;
        
        await this.firebaseAuthService.register(email, password, firstName, lastName);
        
        // Update loading message
        loading.message = 'Sending verification email...';
        
        // Send email verification OTP
        await this.emailJSService.sendEmailVerificationOTP(email);
        
        await loading.dismiss();
        this.isLoading = false;

        const toast = await this.toastController.create({
          message: 'Account created! Please verify your email.',
          duration: 3000,
          color: 'success',
          position: 'top'
        });
        await toast.present();

        // Redirect to OTP verification page
        setTimeout(() => {
          this.router.navigate(['/auth/otp'], {
            state: { 
              email: email,
              type: 'verification' // To distinguish from password reset
            }
          });
        }, 1000);

      } catch (error: any) {
        await loading.dismiss();
        this.isLoading = false;

        const toast = await this.toastController.create({
          message: error.message || 'Registration failed. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.registrationForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
      }
    }
    return '';
  }
}
