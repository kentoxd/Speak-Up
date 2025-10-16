import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isLoginMode = true;
  email = '';
  password = '';
  displayName = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    // Check if user is already logged in
    this.authService.isAuthenticated().subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/tabs/home']);
      }
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.clearForm();
  }

  clearForm() {
    this.email = '';
    this.password = '';
    this.displayName = '';
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.showAlert('Error', 'Please fill in all required fields.');
      return;
    }

    if (!this.isLoginMode && !this.displayName) {
      this.showAlert('Error', 'Please enter your name.');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: this.isLoginMode ? 'Signing in...' : 'Creating account...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      let result;
      if (this.isLoginMode) {
        result = await this.authService.signIn(this.email, this.password);
      } else {
        result = await this.authService.signUp(this.email, this.password, this.displayName);
      }

      await loading.dismiss();
      this.isLoading = false;

      if (result.success) {
        this.showToast(
          this.isLoginMode ? 'Welcome back!' : 'Account created successfully!',
          'success'
        );
        this.router.navigate(['/tabs/home']);
      } else {
        this.showAlert('Error', result.error);
      }
    } catch (error) {
      await loading.dismiss();
      this.isLoading = false;
      this.showAlert('Error', 'An unexpected error occurred. Please try again.');
    }
  }

  async resetPassword() {
    if (!this.email) {
      this.showAlert('Reset Password', 'Please enter your email address first.');
      return;
    }

    const result = await this.authService.resetPassword(this.email);
    if (result.success) {
      this.showAlert('Password Reset', result.message);
    } else {
      this.showAlert('Error', result.error);
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
