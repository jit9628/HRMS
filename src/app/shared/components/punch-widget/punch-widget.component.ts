import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrmsDataService } from '../../../core/services/hrms-data.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-punch-widget',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="punch-card" [ngClass]="{'is-active': isClockedIn()}">
      <div class="punch-status">
        <div class="pulse-dot" [ngClass]="{'active': isClockedIn()}"></div>
        <div class="status-details">
          <span class="status-label">{{ isClockedIn() ? 'Clocked In' : 'Clocked Out' }}</span>
          <span class="status-time">{{ isClockedIn() ? formattedTime() : 'Ready to start' }}</span>
        </div>
      </div>

      <div class="punch-action">
        @if (isClockedIn()) {
          <button type="button" class="btn btn-danger btn-sm" (click)="handleClockOut()">
            <app-icon name="log-out" [size]="16"></app-icon>
            <span>Punch Out</span>
          </button>
        } @else {
          <button type="button" class="btn btn-success btn-sm" (click)="handleClockIn()">
            <app-icon name="log-in" [size]="16"></app-icon>
            <span>Punch In</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .punch-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.5rem 0.875rem;
      background: var(--bg-surface-subtle);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      transition: all var(--transition-fast);

      &.is-active {
        border-color: rgba(16, 185, 129, 0.4);
        background: rgba(16, 185, 129, 0.05);
      }
    }
    .punch-status {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .pulse-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--text-subtle);
      position: relative;

      &.active {
        background: var(--success-500);
        &::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.4);
          animation: pulse 1.8s infinite;
        }
      }
    }
    .status-details {
      display: flex;
      flex-direction: column;
    }
    .status-label {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted);
    }
    .status-time {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-main);
    }

    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 0.9; }
      50% { transform: scale(1.6); opacity: 0; }
      100% { transform: scale(0.9); opacity: 0; }
    }
  `]
})
export class PunchWidgetComponent implements OnInit, OnDestroy {
  private readonly hrmsData = inject(HrmsDataService);
  private readonly toast = inject(NotificationService);

  private timerInterval: any = null;
  readonly timerSeconds = signal<number>(0);

  readonly isClockedIn = computed(() => this.hrmsData.punchState().isClockedIn);

  readonly formattedTime = computed(() => {
    const totalSec = this.timerSeconds();
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  });

  ngOnInit(): void {
    const punch = this.hrmsData.punchState();
    if (punch.isClockedIn) {
      this.timerSeconds.set(punch.elapsedSeconds || 0);
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  handleClockIn(): void {
    this.hrmsData.clockIn();
    this.timerSeconds.set(0);
    this.startTimer();
    this.toast.success('Punched In Successfully', 'Your work shift timer has started.');
  }

  handleClockOut(): void {
    this.hrmsData.clockOut();
    this.stopTimer();
    this.toast.info('Punched Out', 'Shift recorded successfully in attendance log.');
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.timerSeconds.update(s => s + 1);
      // update state periodic
      if (this.timerSeconds() % 30 === 0) {
        this.hrmsData.punchState.update(p => ({ ...p, elapsedSeconds: this.timerSeconds() }));
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
