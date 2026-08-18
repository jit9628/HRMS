import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ToastContainerComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent, ToastContainerComponent],
  template: `
    <div class="layout-wrapper">
      <app-sidebar [isCollapsed]="isSidebarCollapsed()"></app-sidebar>
      <div class="layout-main">
        <app-header (toggleSidebar)="toggleSidebar()"></app-header>
        <main class="layout-content">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-app);
    }
    .layout-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow-x: hidden;
    }
    .layout-content {
      flex: 1;
      padding: 2rem;
      max-width: 1600px;
      width: 100%;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .layout-content {
        padding: 1rem;
      }
    }
  `]
})
export class MainLayoutComponent {
  readonly isSidebarCollapsed = signal<boolean>(false);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(val => !val);
  }
}
