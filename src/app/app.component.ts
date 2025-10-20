import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

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
    
    if (url.includes('mode=resetPassword') || url.includes('oobCode=')) {
      const urlParams = new URL(url).searchParams;
      
      let actionCode = urlParams.get('oobCode');
      let email = urlParams.get('email');
      
      const continueUrl = urlParams.get('continueUrl');
      if (continueUrl) {
        try {
          const continueParams = new URL(decodeURIComponent(continueUrl)).searchParams;
          if (!actionCode) {
            actionCode = continueParams.get('oobCode');
          }
          if (!email) {
            email = continueParams.get('email');
          }
        } catch (error) {
          console.error('Error parsing continueUrl:', error);
        }
      }
      
      console.log('Mode: resetPassword, ActionCode:', actionCode, 'Email:', email, 'ContinueUrl:', continueUrl);
      
      if (actionCode && actionCode !== '$OOB_CODE$' && actionCode.length > 10) {
        if (!url.includes('/auth/create-password')) {
          console.log('Navigating to create-password with:', { actionCode, email });
          this.router.navigate(['/auth/create-password'], {
            state: { actionCode, email }
          });
        } else {
          console.log('Already on create-password page, updating with action code:', actionCode);
          sessionStorage.setItem('passwordResetActionCode', actionCode);
          sessionStorage.setItem('passwordResetEmail', email || '');
        }
      } else {
        console.error('No valid action code found in password reset URL');
        this.router.navigate(['/auth/forgot-password']);
      }
    }
  }
}
