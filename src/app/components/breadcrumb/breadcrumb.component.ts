import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-breadcrumb',
  template: `
    <div class="breadcrumb-container" *ngIf="breadcrumbs.length > 0">
      <ion-item lines="none" class="breadcrumb-item">
        <ion-label>
          <div class="breadcrumb-list">
            <span 
              *ngFor="let crumb of breadcrumbs; let last = last; let i = index" 
              class="breadcrumb-link"
              [class.active]="last"
              (click)="!last && navigateTo(crumb.route)">
              {{ crumb.label }}
              <ion-icon *ngIf="!last" name="chevron-forward" class="breadcrumb-separator"></ion-icon>
            </span>
          </div>
        </ion-label>
      </ion-item>
    </div>
  `,
  styles: [`
    .breadcrumb-container {
      padding: 0.5rem 1rem;
      background: rgba(var(--ion-color-light-rgb), 0.5);
      border-bottom: 1px solid var(--ion-color-light-shade);
    }

    .breadcrumb-item {
      --padding-start: 0;
      --inner-padding-end: 0;
      --background: transparent;
      --min-height: auto;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.25rem;
      font-size: 0.875rem;
    }

    .breadcrumb-link {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--ion-color-medium);
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover:not(.active) {
        color: var(--ion-color-primary);
        text-decoration: underline;
      }

      &.active {
        color: var(--ion-color-primary);
        font-weight: 600;
        cursor: default;
      }
    }

    .breadcrumb-separator {
      font-size: 0.75rem;
      color: var(--ion-color-medium);
    }
  `]
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute)
      )
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
      });

    // Initial load
    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map(segment => segment.path)
        .join('/');

      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      // Get breadcrumb label from route data or use route path
      const label = child.snapshot.data['breadcrumb'] || 
                   this.formatLabel(routeURL) || 
                   child.snapshot.data['title'];

      if (label && url) {
        breadcrumbs.push({ label, route: url });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  private formatLabel(path: string): string {
    if (!path) return '';
    
    // Convert path to readable label
    return path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/\//g, '');
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}

