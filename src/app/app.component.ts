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
    
    // Check if this is a Firebase password reset link
    if (url.includes('mode=resetPassword') || url.includes('__/auth/action')) {
      const urlParams = new URL(url).searchParams;
      const mode = urlParams.get('mode');
      const actionCode = urlParams.get('oobCode');
      const email = urlParams.get('email');
      
      console.log('Mode:', mode, 'ActionCode:', actionCode, 'Email:', email);
      
      if (mode === 'resetPassword' && actionCode && email) {
        // Only navigate if not already on the create-password page
        if (!url.includes('/auth/create-password')) {
          console.log('Navigating to create-password with:', { actionCode, email });
          this.router.navigate(['/auth/create-password'], {
            state: { actionCode, email }
          });
        }
      }
    }
  }
}