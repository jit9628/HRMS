import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'primary' | 'neutral' | 'info';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass()">
      <span class="badge-dot" *ngIf="showDot()"></span>
      <ng-content></ng-content>
      {{ label() }}
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: currentColor;
    }
  `]
})
export class BadgeComponent {
  variant = input<BadgeVariant>('neutral');
  label = input<string>('');
  showDot = input<boolean>(true);

  badgeClass = computed(() => `badge-${this.variant()}`);
}
