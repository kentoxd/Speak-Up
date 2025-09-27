import { Component, OnInit } from '@angular/core';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  
  constructor(private storageService: StorageService) {}

  async ngOnInit() {
    await this.storageService.init();
    await this.initializeTheme();
  }

  private async initializeTheme() {
    // Force dark mode as default
    document.body.classList.add('dark');
    
    // Also set in storage for consistency
    await this.storageService.setDarkModeEnabled(true);
    
    console.log('Dark theme applied:', document.body.classList.contains('dark'));
  }
}
