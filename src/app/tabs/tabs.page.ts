import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  activeTab = 'home';

  constructor(private router: Router) {}

  ngOnInit() {
    // Track current route to highlight active tab
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        if (url.includes('/tabs/home')) {
          this.activeTab = 'home';
        } else if (url.includes('/tabs/lessons')) {
          this.activeTab = 'lessons';
        } else if (url.includes('/tabs/practice')) {
          this.activeTab = 'practice';
        } else if (url.includes('/tabs/profile')) {
          this.activeTab = 'profile';
        }
      });
    
    // Set initial active tab
    const currentUrl = this.router.url;
    if (currentUrl.includes('/tabs/home')) {
      this.activeTab = 'home';
    } else if (currentUrl.includes('/tabs/lessons')) {
      this.activeTab = 'lessons';
    } else if (currentUrl.includes('/tabs/practice')) {
      this.activeTab = 'practice';
    } else if (currentUrl.includes('/tabs/profile')) {
      this.activeTab = 'profile';
    }
  }
}