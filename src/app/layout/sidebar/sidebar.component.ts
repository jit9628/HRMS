import { Component, input, inject, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AuthService } from '../../core/services/auth.service';
import { MenuApiService, UserFeature } from '../../core/services/menu-api.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed()">
      <!-- Brand Logo -->
      <div class="sidebar-brand">
        <div class="logo-icon">
          <app-icon name="award" [size]="24"></app-icon>
        </div>
        @if (!isCollapsed()) {
          <div class="brand-text">
            <h2>Pulse<span>HRMS</span></h2>
            <span class="version-tag">v19.2</span>
          </div>
        }
      </div>

      <!-- Navigation Section -->
      <div class="sidebar-menu">
        <div class="menu-section-label" *ngIf="!isCollapsed()">CORE WORKSPACE</div>
        <nav class="nav-list">
          @for (item of navItems(); track item.path) {
            <div class="nav-item-group">
              <div class="nav-link-row">
                <a 
                  [routerLink]="item.path" 
                  routerLinkActive="active" 
                  class="nav-link"
                  [title]="isCollapsed() ? item.label : ''">
                  <span class="nav-icon">
                    <app-icon [name]="item.icon" [size]="20"></app-icon>
                  </span>
                  @if (!isCollapsed()) {
                    <span class="nav-text">{{ item.label }}</span>
                    @if (item.badge && item.badge > 0) {
                      <span class="nav-badge">{{ item.badge }}</span>
                    }
                  }
                </a>
                @if (!isCollapsed() && item.children?.length) {
                  <button type="button" class="submenu-toggle" (click)="toggleExpanded(item.path)" [attr.aria-label]="'Toggle ' + item.label + ' submenu'">
                    <app-icon [name]="isExpanded(item.path) ? 'chevron-down' : 'chevron-right'" [size]="14"></app-icon>
                  </button>
                }
              </div>
              @if (!isCollapsed() && item.children?.length && isExpanded(item.path)) {
                <div class="submenu-list">
                  @for (child of item.children; track child.path) {
                    <a [routerLink]="child.path" routerLinkActive="active" class="submenu-link">
                      <span class="submenu-marker"></span>
                      <span>{{ child.label }}</span>
                    </a>
                  }
                </div>
              }
            </div>
          }
        </nav>
      </div>

      <!-- Quick User Card -->
      <div class="sidebar-footer">
        <div class="user-mini-card">
          <div class="avatar avatar-sm">{{ authService.currentUser()?.avatarInitials || 'JS' }}</div>
          @if (!isCollapsed()) {
            <div class="user-info">
              <span class="user-name">{{ authService.currentUser()?.name || 'Jitendra Shukla' }}</span>
              <span class="user-role">{{ authService.currentUser()?.role || 'Admin' }}</span>
            </div>
            <button type="button" class="btn-logout-mini" (click)="authService.logout()" title="Logout">
              <app-icon name="log-out" [size]="16"></app-icon>
            </button>
          }
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--sidebar-border);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: width var(--transition-normal);
      position: sticky;
      top: 0;
      z-index: 100;
      user-select: none;

      &.collapsed {
        width: var(--sidebar-collapsed-width);

        .sidebar-brand {
          justify-content: center;
          padding: 1.25rem 0;
        }

        .nav-link {
          justify-content: center;
          padding: 0.75rem 0;
        }

        .user-mini-card {
          justify-content: center;
          padding: 0.75rem 0;
        }
      }
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--sidebar-border);

      .logo-icon {
        width: 38px;
        height: 38px;
        border-radius: var(--radius-md);
        background: linear-gradient(135deg, var(--primary-600), var(--accent-purple));
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      }

      .brand-text {
        h2 {
          font-size: 1.125rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
          span {
            color: var(--primary-400);
          }
        }
        .version-tag {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--primary-300);
          background: rgba(99, 102, 241, 0.2);
          padding: 0.125rem 0.375rem;
          border-radius: var(--radius-sm);
        }
      }
    }

    .sidebar-menu {
      flex: 1;
      padding: 1.25rem 0.875rem;
      overflow-y: auto;

      .menu-section-label {
        font-size: 0.6875rem;
        font-weight: 700;
        color: #475569;
        letter-spacing: 0.08em;
        margin-bottom: 0.625rem;
        padding-left: 0.75rem;
      }
    }

    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-item-group { width: 100%; }

    .nav-link-row {
      display: flex;
      align-items: center;
    }

    .nav-link-row .nav-link { flex: 1; }

    .submenu-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 32px;
      margin-right: 0.25rem;
      color: var(--sidebar-text);
      background: transparent;
      border: 0;
      cursor: pointer;
      border-radius: var(--radius-sm);
    }

    .submenu-toggle:hover { background: rgba(255, 255, 255, 0.06); color: #ffffff; }

    .submenu-list {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      margin: 0.15rem 0 0.35rem 2.2rem;
      border-left: 1px solid var(--sidebar-border);
      padding-left: 0.65rem;
    }

    .submenu-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 30px;
      padding: 0.35rem 0.5rem;
      color: var(--sidebar-text);
      font-size: 0.78rem;
      border-radius: var(--radius-sm);
    }

    .submenu-link:hover,
    .submenu-link.active { color: var(--sidebar-active-text); background: var(--sidebar-active-bg); }

    .submenu-marker { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.7; }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.625rem 0.875rem;
      border-radius: var(--radius-md);
      color: var(--sidebar-text);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all var(--transition-fast);

      .nav-icon {
        display: flex;
        align-items: center;
        color: inherit;
      }

      .nav-text {
        flex: 1;
      }

      .nav-badge {
        font-size: 0.6875rem;
        font-weight: 700;
        background: var(--primary-500);
        color: #ffffff;
        padding: 0.125rem 0.45rem;
        border-radius: var(--radius-full);
      }

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #ffffff;
      }

      &.active {
        background: var(--sidebar-active-bg);
        color: var(--sidebar-active-text);
        font-weight: 600;
        border-left: 3px solid var(--primary-400);
      }
    }

    .sidebar-footer {
      padding: 1rem 0.875rem;
      border-top: 1px solid var(--sidebar-border);

      .user-mini-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.625rem;
        border-radius: var(--radius-md);
        background: rgba(255, 255, 255, 0.03);

        .user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;

          .user-name {
            font-size: 0.8125rem;
            font-weight: 600;
            color: #f1f5f9;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .user-role {
            font-size: 0.6875rem;
            color: #94a3b8;
          }
        }

        .btn-logout-mini {
          color: #94a3b8;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          &:hover {
            color: var(--danger-500);
            background: rgba(244, 63, 94, 0.1);
          }
        }
      }
    }
  `]
})
export class SidebarComponent {
  isCollapsed = input<boolean>(false);
  readonly authService = inject(AuthService);
  private readonly menuApi = inject(MenuApiService);
  private readonly apiMenuItems = signal<UserFeature[]>([]);
  private readonly menuLoaded = signal(false);
  private readonly expandedMenus = signal(new Set<string>());

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      this.apiMenuItems.set([]);
      this.menuLoaded.set(false);

      if (!user) return;

      this.menuApi.getCurrentUserFeatures().subscribe({
        next: features => {
          this.apiMenuItems.set(features.filter(feature => feature.enabled));
          this.menuLoaded.set(true);
        },
        error: () => this.menuLoaded.set(true)
      });
    });
  }

  readonly navItems = computed<NavItem[]>(() => {
    return this.menuLoaded() ? this.apiMenuItems().map(feature => ({
      path: feature.path,
      label: feature.title,
      icon: feature.icon,
      badge: feature.badge,
      children: feature.children?.filter(child => child.enabled).map(child => ({
        path: child.path,
        label: child.title,
        icon: child.icon,
        badge: child.badge
      }))
    })) : [];
  });

  isExpanded(path: string): boolean {
    return this.expandedMenus().has(path);
  }

  toggleExpanded(path: string): void {
    const expanded = new Set(this.expandedMenus());
    if (expanded.has(path)) expanded.delete(path);
    else expanded.add(path);
    this.expandedMenus.set(expanded);
  }
}
