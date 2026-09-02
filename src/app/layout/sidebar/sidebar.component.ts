import { Component, input, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AuthService } from '../../core/services/auth.service';
import { FeatureApiService, UserFeature } from '../../core/services/feature-api.service';

type NavItem = UserFeature;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isCollapsed = input<boolean>(false);
  private readonly featureApi = inject(FeatureApiService);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  // Track expanded parent menus by id or code
  readonly openSubmenus = signal<Record<string, boolean>>({
    'feat-manage-menu': true,
    'MANAGE_MENU': true,
  });

  readonly navItems = computed<NavItem[]>(() => {
    const features = this.featureApi.activeFeatures();
    return features
      .filter(feature => feature.enabled)
      .map(feature => {
        if (feature.children && feature.children.length > 0) {
          return {
            ...feature,
            children: feature.children.filter(child => child.enabled).sort((a, b) => a.orderIndex - b.orderIndex)
          };
        }
        return feature;
      })
      .sort((first, second) => first.orderIndex - second.orderIndex);
  });

  constructor() {
    // Reactively reload features when user logs in or switches
    effect(() => {
      const user = this.authService.currentUser();
      this.loadFeatures();
    });

    // Auto expand parent menus if currently on a child route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkAndAutoExpandSubmenu(event.urlAfterRedirects || event.url);
    });
  }

  loadFeatures(): void {
    this.featureApi.getCurrentUserFeatures().subscribe({
      next: () => {
        this.checkAndAutoExpandSubmenu(this.router.url);
      },
      error: error => {
        console.error('Unable to load navigation features:', error);
      }
    });
  }

  toggleSubmenu(item: UserFeature, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const key = item.id || item.code;
    const current = this.openSubmenus();
    const isCurrentlyOpen = !!current[key];
    this.openSubmenus.set({
      ...current,
      [key]: !isCurrentlyOpen
    });
  }

  isSubmenuOpen(item: UserFeature): boolean {
    const key = item.id || item.code;
    return !!this.openSubmenus()[key];
  }

  isSubmenuActive(item: UserFeature): boolean {
    if (!item.children || item.children.length === 0) return false;
    const currentUrl = this.router.url;
    return item.children.some(child => child.path && currentUrl.startsWith(child.path));
  }

  private checkAndAutoExpandSubmenu(url: string): void {
    if (!url) return;
    const current = { ...this.openSubmenus() };
    let hasChanges = false;

    for (const item of this.navItems()) {
      if (item.children && item.children.length > 0) {
        const matchesChild = item.children.some(c => c.path && (url === c.path || url.startsWith(c.path + '/')));
        if (matchesChild) {
          const key = item.id || item.code;
          if (!current[key]) {
            current[key] = true;
            hasChanges = true;
          }
        }
      }
    }

    if (hasChanges) {
      this.openSubmenus.set(current);
    }
  }
}
