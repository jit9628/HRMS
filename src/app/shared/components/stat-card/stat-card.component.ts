import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="card stat-card card-hover" [style.--accent-color]="accentColor()">
      <div class="stat-header">
        <div class="stat-info">
          <span class="stat-title">{{ title() }}</span>
          <h3 class="stat-value">{{ value() }}</h3>
        </div>
        <div class="stat-icon-box" [style.background]="iconBg()" [style.color]="accentColor()">
          <app-icon [name]="icon()" [size]="24"></app-icon>
        </div>
      </div>
      @if (trend() || subtitle()) {
        <div class="stat-footer">
          @if (trend()) {
            <span class="trend-pill" [ngClass]="trendType() === 'up' ? 'trend-up' : 'trend-down'">
              <app-icon [name]="trendType() === 'up' ? 'trending-up' : 'trending-down'" [size]="14"></app-icon>
              {{ trend() }}
            </span>
          }
          @if (subtitle()) {
            <span class="stat-sub">{{ subtitle() }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .stat-card {
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
      border-left: 4px solid var(--accent-color, var(--primary-500));
    }
    .stat-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }
    .stat-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-main);
      margin-top: 0.25rem;
      letter-spacing: -0.02em;
    }
    .stat-icon-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .stat-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .trend-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 700;
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-sm);
    }
    .trend-up {
      color: var(--success-600);
      background: var(--success-50);
    }
    .trend-down {
      color: var(--danger-600);
      background: var(--danger-50);
    }
  `]
})
export class StatCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  icon = input.required<string>();
  accentColor = input<string>('var(--primary-500)');
  iconBg = input<string>('var(--primary-50)');
  trend = input<string>('');
  trendType = input<'up' | 'down'>('up');
  subtitle = input<string>('');
}
