import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
})
export class SplashScreenComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    // Auto-redirect to landing page after 3 seconds
    setTimeout(() => {
      this.router.navigate(['/auth/landing']);
    }, 3000);
  }
}
