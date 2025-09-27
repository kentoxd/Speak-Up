import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {

  constructor(
    private router: Router,
    private storageService: StorageService
  ) { }

  async ngOnInit() {
    // Show splash for 2 seconds, then check if user has seen welcome
    setTimeout(async () => {
      const isFirstTime = await this.storageService.isFirstTimeUser();
      
      if (isFirstTime) {
        this.router.navigate(['/welcome']);
      } else {
        this.router.navigate(['/tabs']);
      }
    }, 2000);
  }

}
