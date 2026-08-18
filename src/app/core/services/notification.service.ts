import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly toasts = signal<ToastMessage[]>([]);

  show(title: string, message: string, type: ToastType = 'info', durationMs = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = {
      id,
      title,
      message,
      type,
      timestamp: new Date()
    };

    this.toasts.update(current => [toast, ...current]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, durationMs);
    }
  }

  success(title: string, message: string): void {
    this.show(title, message, 'success');
  }

  info(title: string, message: string): void {
    this.show(title, message, 'info');
  }

  warning(title: string, message: string): void {
    this.show(title, message, 'warning');
  }

  error(title: string, message: string): void {
    this.show(title, message, 'error', 6000);
  }

  dismiss(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
