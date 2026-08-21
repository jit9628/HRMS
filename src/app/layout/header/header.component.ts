import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PunchWidgetComponent } from '../../shared/components/punch-widget/punch-widget.component';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { HrmsDataService } from '../../core/services/hrms-data.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, PunchWidgetComponent],
  template: `
    <header class="top-header">
      <!-- Left: Toggle & Global Search -->
      <div class="header-left">
        <button type="button" class="btn btn-icon btn-secondary" (click)="toggleSidebar.emit()" aria-label="Toggle Sidebar">
          <app-icon name="menu" [size]="20"></app-icon>
        </button>

        <div class="global-search-container">
          <div class="input-icon-wrapper">
            <span class="input-icon">
              <app-icon name="search" [size]="18"></app-icon>
            </span>
            <input 
              type="text" 
              class="form-control search-input" 
              placeholder="Search employees, departments, policies..."
              [value]="searchQuery()"
              (input)="onSearchChange($event)"
              (focus)="showSearchResults.set(true)"
            />
          </div>

          <!-- Live Search Dropdown -->
          @if (showSearchResults() && searchResults().length > 0) {
            <div class="search-dropdown card">
              <div class="dropdown-header">Matching Employees ({{ searchResults().length }})</div>
              @for (emp of searchResults(); track emp.id) {
                <div class="search-item" (click)="navigateToEmployee(emp.id)">
                  <div class="avatar avatar-sm">{{ emp.firstName[0] }}{{ emp.lastName[0] }}</div>
                  <div class="search-item-info">
                    <span class="name">{{ emp.firstName }} {{ emp.lastName }}</span>
                    <span class="sub">{{ emp.designation }} • {{ emp.department }}</span>
                  </div>
                  <span class="badge badge-primary">{{ emp.id }}</span>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Right: Company Switcher, Punch widget, Theme toggle, Notifications, User profile -->
      <div class="header-right">
        <!-- Active Company Pill (Logged-in company only) -->
        <div class="company-header-wrapper">
          <div class="company-header-pill static-pill" [title]="authService.currentUser()?.companyName || 'Organization'">
            <div class="company-dot"></div>
            <div class="company-text">
              <span class="company-label">ORGANIZATION</span>
              <span class="company-name">{{ authService.currentUser()?.companyName || 'Corporate Workspace' }}</span>
            </div>
          </div>
        </div>

        <!-- Punch Widget -->
        <app-punch-widget></app-punch-widget>

        <!-- Theme Switcher -->
        <button 
          type="button" 
          class="btn btn-icon btn-secondary theme-toggle-btn" 
          (click)="themeService.toggleTheme()" 
          [title]="'Switch to ' + (themeService.currentTheme() === 'light' ? 'Dark' : 'Light') + ' Mode'">
          <app-icon [name]="themeService.currentTheme() === 'light' ? 'moon' : 'sun'" [size]="20"></app-icon>
        </button>

        <!-- Notification Bell Dropdown -->
        <div class="notif-wrapper">
          <button 
            type="button" 
            class="btn btn-icon btn-secondary notif-btn" 
            (click)="toggleNotifications()"
            aria-label="Notifications">
            <app-icon name="bell" [size]="20"></app-icon>
            @if (unreadNotifCount() > 0) {
              <span class="notif-badge">{{ unreadNotifCount() }}</span>
            }
          </button>

          @if (showNotifications()) {
            <div class="notifications-dropdown card" (click)="$event.stopPropagation()">
              <div class="dropdown-header flex-between">
                <span>Recent Announcements</span>
                <span class="badge badge-primary">{{ announcements().length }} Total</span>
              </div>
              <div class="notif-list">
                @for (ann of announcements(); track ann.id) {
                  <div class="notif-item">
                    <div class="notif-title">{{ ann.title }}</div>
                    <div class="notif-content">{{ ann.content }}</div>
                    <div class="notif-meta">{{ ann.author }} • {{ ann.date }}</div>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- User Profile Pill & Dropdown -->
        <div class="profile-wrapper">
          <div class="profile-pill" (click)="toggleProfileMenu()">
            <div class="avatar avatar-sm">{{ authService.currentUser()?.avatarInitials || 'JS' }}</div>
            <div class="profile-info">
              <span class="profile-name">{{ authService.currentUser()?.name || 'Jitendra Shukla' }}</span>
              <span class="profile-role">{{ authService.currentUser()?.role || 'Admin' }}</span>
            </div>
            <app-icon name="chevron-down" [size]="14"></app-icon>
          </div>

          @if (showProfileMenu()) {
            <div class="profile-dropdown card" (click)="$event.stopPropagation()">
              <div class="dropdown-user-header">
                <div class="avatar avatar-md">{{ authService.currentUser()?.avatarInitials || 'JS' }}</div>
                <div class="user-text">
                  <div class="u-name">{{ authService.currentUser()?.name }}</div>
                  <div class="u-email">{{ authService.currentUser()?.email }}</div>
                  <span class="badge badge-primary">{{ authService.currentUser()?.role }}</span>
                </div>
              </div>

              <div class="dropdown-menu-list">
                <a routerLink="/settings" class="menu-item" (click)="showProfileMenu.set(false)">
                  <app-icon name="settings" [size]="16"></app-icon>
                  <span>Account Settings</span>
                </a>
                <button type="button" class="menu-item logout-item" (click)="handleLogout()">
                  <app-icon name="log-out" [size]="16"></app-icon>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .top-header {
      height: var(--header-height);
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.75rem;
      position: sticky;
      top: 0;
      z-index: 90;
      backdrop-filter: blur(8px);
      transition: background-color var(--transition-normal), border-color var(--transition-normal);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
      max-width: 480px;
    }

    .global-search-container {
      position: relative;
      flex: 1;

      .search-input {
        background: var(--bg-surface-subtle);
        border-color: transparent;
        border-radius: var(--radius-full);
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        font-size: 0.8125rem;

        &:focus {
          border-color: var(--primary-400);
          background: var(--bg-surface);
        }
      }
    }

    .search-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      padding: 0.5rem;
      z-index: 150;
      max-height: 320px;
      overflow-y: auto;

      .dropdown-header {
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        padding: 0.5rem 0.75rem;
      }

      .search-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: background-color var(--transition-fast);

        &:hover {
          background-color: var(--bg-surface-hover);
        }

        .search-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;

          .name {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-main);
          }
          .sub {
            font-size: 0.75rem;
            color: var(--text-muted);
          }
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .theme-toggle-btn {
      color: var(--text-muted);
      &:hover {
        color: var(--text-main);
      }
    }

    .notif-wrapper {
      position: relative;

      .notif-btn {
        position: relative;
        color: var(--text-muted);
        &:hover { color: var(--text-main); }
      }

      .notif-badge {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--danger-500);
        color: #ffffff;
        font-size: 0.625rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .notifications-dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      width: 360px;
      max-height: 420px;
      overflow-y: auto;
      z-index: 150;
      padding: 0;

      .dropdown-header {
        padding: 0.875rem 1rem;
        border-bottom: 1px solid var(--border-color);
        font-weight: 700;
        font-size: 0.875rem;
      }

      .notif-item {
        padding: 0.875rem 1rem;
        border-bottom: 1px solid var(--border-color);
        transition: background-color var(--transition-fast);

        &:hover {
          background-color: var(--bg-surface-hover);
        }

        .notif-title {
          font-weight: 600;
          font-size: 0.8125rem;
          color: var(--text-main);
        }

        .notif-content {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
          line-height: 1.4;
        }

        .notif-meta {
          font-size: 0.6875rem;
          color: var(--text-subtle);
          margin-top: 0.375rem;
        }
      }
    }

    .profile-wrapper {
      position: relative;
    }

    .profile-pill {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.375rem 0.75rem 0.375rem 0.375rem;
      border-radius: var(--radius-full);
      background: var(--bg-surface-subtle);
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--primary-400);
      }

      .profile-info {
        display: flex;
        flex-direction: column;
        line-height: 1.2;

        .profile-name {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .profile-role {
          font-size: 0.6875rem;
          color: var(--text-muted);
        }
      }
    }

    .profile-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 240px;
      padding: 0.75rem;
      z-index: 150;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .dropdown-user-header {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border-color);

        .user-text {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          overflow: hidden;

          .u-name { font-size: 0.875rem; font-weight: 700; color: var(--text-main); }
          .u-email { font-size: 0.6875rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        }
      }

      .dropdown-menu-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.625rem;
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          color: var(--text-main);
          font-weight: 500;
          transition: background-color var(--transition-fast);
          width: 100%;
          text-align: left;

          &:hover {
            background-color: var(--bg-surface-hover);
          }

          &.logout-item {
            color: var(--danger-600);
            &:hover {
              background-color: var(--danger-50);
            }
          }
        }
      }
    }

    .company-header-wrapper {
      position: relative;

      .company-header-pill {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.75rem;
        border-radius: var(--radius-md);
        background: var(--bg-surface-subtle);
        border: 1px solid var(--border-color);
        cursor: pointer;
        transition: all var(--transition-fast);

        &:hover {
          background: var(--bg-surface-hover);
          border-color: var(--primary-400);
        }

        .company-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--success-500);
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .company-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;

          .company-label {
            font-size: 0.5625rem;
            font-weight: 700;
            color: var(--text-subtle);
            letter-spacing: 0.05em;
          }

          .company-name {
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--text-main);
            max-width: 140px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .company-dropdown {
        position: absolute;
        top: calc(100% + 12px);
        right: 0;
        width: 300px;
        z-index: 150;
        padding: 0;

        .dropdown-header {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-color);
          font-weight: 700;
          font-size: 0.8125rem;
        }

        .company-dropdown-list {
          padding: 0.375rem;
          max-height: 240px;
          overflow-y: auto;
        }

        .company-dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.625rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background-color var(--transition-fast);

          &:hover {
            background-color: var(--bg-surface-hover);
          }

          &.active {
            background-color: var(--primary-50);
            color: var(--primary-700);
          }

          .c-item-dot {
            width: 10px;
            height: 10px;
            border-radius: var(--radius-xs);
            flex-shrink: 0;
          }

          .c-item-name {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-main);
          }

          .c-item-sub {
            font-size: 0.6875rem;
            color: var(--text-muted);
          }
        }
      }
    }

    @media (max-width: 768px) {
      .header-left {
        max-width: 220px;
      }
      .profile-info, .company-header-pill {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  toggleSidebar = output<void>();

  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);
  private readonly hrmsData = inject(HrmsDataService);
  private readonly router = inject(Router);

  readonly companies = this.hrmsData.companies;
  readonly searchQuery = signal<string>('');
  readonly showSearchResults = signal<boolean>(false);
  readonly showNotifications = signal<boolean>(false);
  readonly showProfileMenu = signal<boolean>(false);
  readonly showCompanyMenu = signal<boolean>(false);

  readonly announcements = this.hrmsData.announcements;
  readonly unreadNotifCount = signal<number>(3);

  readonly searchResults = signal<any[]>([]);

  onSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    if (!val.trim()) {
      this.searchResults.set([]);
      return;
    }
    const q = val.toLowerCase();
    const matches = this.hrmsData.employees().filter(emp =>
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
      emp.designation.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q) ||
      emp.id.toLowerCase().includes(q)
    );
    this.searchResults.set(matches);
  }

  toggleCompanyMenu(): void {
    this.showCompanyMenu.update(s => !s);
    if (this.showCompanyMenu()) {
      this.showNotifications.set(false);
      this.showProfileMenu.set(false);
    }
  }

  selectCompany(company: any): void {
    this.authService.switchCompany(company);
    this.showCompanyMenu.set(false);
  }

  toggleNotifications(): void {
    this.showNotifications.update(s => !s);
    if (this.showNotifications()) {
      this.unreadNotifCount.set(0);
      this.showCompanyMenu.set(false);
      this.showProfileMenu.set(false);
    }
  }

  toggleProfileMenu(): void {
    this.showProfileMenu.update(s => !s);
    if (this.showProfileMenu()) {
      this.showCompanyMenu.set(false);
      this.showNotifications.set(false);
    }
  }

  handleLogout(): void {
    this.showProfileMenu.set(false);
    this.authService.logout();
  }

  navigateToEmployee(id: string): void {
    this.showSearchResults.set(false);
    this.searchQuery.set('');
    this.router.navigate(['/employees', id]);
  }
}
