import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="toast-container">
      @for (toast of toasts(); track toast.id) {
        <div class="toast-item" [ngClass]="'toast-' + toast.type">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') { <app-icon name="check-circle" [size]="20"></app-icon> }
              @case ('error') { <app-icon name="alert-circle" [size]="20"></app-icon> }
              @case ('warning') { <app-icon name="alert-circle" [size]="20"></app-icon> }
              @default { <app-icon name="bell" [size]="20"></app-icon> }
            }
          </div>
          <div class="toast-content">
            <h4 class="toast-title">{{ toast.title }}</h4>
            <p class="toast-msg">{{ toast.message }}</p>
          </div>
          <button type="button" class="toast-close" (click)="dismiss(toast.id)">
            <app-icon name="x" [size]="16"></app-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 380px;
      width: calc(100vw - 3rem);
      pointer-events: none;
    }
    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-lg);
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all var(--transition-fast);

      &.toast-success {
        border-left: 4px solid var(--success-500);
        .toast-icon { color: var(--success-500); }
      }
      &.toast-error {
        border-left: 4px solid var(--danger-500);
        .toast-icon { color: var(--danger-500); }
      }
      &.toast-warning {
        border-left: 4px solid var(--warning-500);
        .toast-icon { color: var(--warning-500); }
      }
      &.toast-info {
        border-left: 4px solid var(--info-500);
        .toast-icon { color: var(--info-500); }
      }
    }
    .toast-content {
      flex: 1;
      min-width: 0;
    }
    .toast-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.125rem;
    }
    .toast-msg {
      font-size: 0.8125rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .toast-close {
      color: var(--text-subtle);
      padding: 0.25rem;
      border-radius: var(--radius-sm);
      &:hover { color: var(--text-main); }
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastContainerComponent {
  private readonly notificationService = inject(NotificationService);
  readonly toasts = this.notificationService.toasts;

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
