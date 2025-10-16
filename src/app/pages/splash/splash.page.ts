import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {

  constructor(
    private router: Router,
    private storageService: StorageService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    // Show splash for 2 seconds, then check authentication
    setTimeout(async () => {
      this.authService.isAuthenticated().subscribe(isAuth => {
        if (isAuth) {
          this.router.navigate(['/tabs']);
        } else {
          this.router.navigate(['/login']);
        }
      });
    }, 2000);
  }

}
