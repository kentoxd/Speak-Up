import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './services/storage.service';
import { environment } from '../environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  geminiApiKey = environment.geminiApiKey;
  constructor(
    private storageService: StorageService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.storageService.init();
    this.handlePasswordResetLink();
  }

  private handlePasswordResetLink() {
    const url = window.location.href;
    
    console.log('Current URL:', url);
    
    // Check if this is a Firebase password reset link
    if (url.includes('mode=resetPassword') || url.includes('oobCode=')) {
      const urlParams = new URL(url).searchParams;
      
      // Get the action code (oobCode) from the URL
      let actionCode = urlParams.get('oobCode');
      let email = urlParams.get('email');
      
      // If we have a continueUrl, parse it for additional parameters
      const continueUrl = urlParams.get('continueUrl');
      if (continueUrl) {
        try {
          const continueParams = new URL(decodeURIComponent(continueUrl)).searchParams;
          // If we don't have actionCode from main URL, try to get it from continueUrl
          if (!actionCode) {
            actionCode = continueParams.get('oobCode');
          }
          // If we don't have email from main URL, try to get it from continueUrl
          if (!email) {
            email = continueParams.get('email');
          }
        } catch (error) {
          console.error('Error parsing continueUrl:', error);
        }
      }
      
      console.log('Mode: resetPassword, ActionCode:', actionCode, 'Email:', email, 'ContinueUrl:', continueUrl);
      
      // If we have an action code, navigate to create password page
      if (actionCode && actionCode !== '$OOB_CODE$' && actionCode.length > 10) {
        if (!url.includes('/auth/create-password')) {
          console.log('Navigating to create-password with:', { actionCode, email });
          this.router.navigate(['/auth/create-password'], {
            state: { actionCode, email }
          });
        } else {
          // If we're already on the create-password page but have URL parameters,
          // we need to update the page with the correct action code
          console.log('Already on create-password page, updating with action code:', actionCode);
          // Store the action code in sessionStorage so the component can access it
          sessionStorage.setItem('passwordResetActionCode', actionCode);
          sessionStorage.setItem('passwordResetEmail', email || '');
        }
      } else {
        console.error('No valid action code found in password reset URL');
        // Show error message or redirect to forgot password page
        this.router.navigate(['/auth/forgot-password']);
      }
    }
  }
}