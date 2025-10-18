import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit, OnDestroy {
  currentPage = 1;
  private autoSlideInterval: any;
  private touchStartX = 0;
  private touchEndX = 0;

  constructor(private router: Router) { }

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  private startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextPage();
    }, 5000);
  }

  private nextPage() {
    this.currentPage = this.currentPage === 3 ? 1 : this.currentPage + 1;
  }

  private prevPage() {
    this.currentPage = this.currentPage === 1 ? 3 : this.currentPage - 1;
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.resetAutoSlide();
  }

  private resetAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    this.startAutoSlide();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - next page
        this.nextPage();
      } else {
        // Swiped right - previous page
        this.prevPage();
      }
      this.resetAutoSlide();
    }
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goToSignIn() {
    this.router.navigate(['/auth/signin']);
  }
}