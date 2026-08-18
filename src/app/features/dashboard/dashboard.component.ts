import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HrmsDataService } from '../../core/services/hrms-data.service';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, StatCardComponent, BadgeComponent],
  template: `
    <div class="dashboard-page">
      <!-- Welcome Hero Banner -->
      <div class="welcome-hero card">
        <div class="hero-content">
          <span class="hero-badge">Welcome back, {{ authService.currentUser()?.name || 'Administrator' }} 👋</span>
          <h1 class="hero-title">PulseHRMS Intelligence Center</h1>
          <p class="hero-subtitle">Here is a snapshot of your workforce operations, attendance, and team milestones today.</p>
        </div>
        <div class="hero-actions">
          @if (authService.currentUser()?.role === 'Admin' || authService.currentUser()?.role === 'Super Admin') {
            <a routerLink="/companies" class="btn btn-secondary">
              <app-icon name="building" [size]="18"></app-icon>
              <span>Companies ({{ companies().length }})</span>
            </a>
          }
          <a routerLink="/employees" class="btn btn-primary">
            <app-icon name="user-plus" [size]="18"></app-icon>
            <span>Directory</span>
          </a>
          <a routerLink="/leaves" class="btn btn-secondary">
            <app-icon name="calendar" [size]="18"></app-icon>
            <span>Leave Requests ({{ pendingLeaves().length }})</span>
          </a>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="grid-4 stats-grid">
        <app-stat-card
          title="Total Headcount"
          [value]="totalEmployees()"
          icon="users"
          accentColor="var(--primary-500)"
          iconBg="var(--primary-50)"
          trend="+12% YoY"
          trendType="up"
          subtitle="Across 5 departments"
        ></app-stat-card>

        <app-stat-card
          title="Present Today"
          [value]="presentToday() + ' / ' + totalEmployees()"
          icon="clock"
          accentColor="var(--success-500)"
          iconBg="var(--success-50)"
          trend="92% Attendance"
          trendType="up"
          subtitle="2 Late punches"
        ></app-stat-card>

        <app-stat-card
          title="Pending Leaves"
          [value]="pendingLeaves().length"
          icon="calendar"
          accentColor="var(--warning-500)"
          iconBg="var(--warning-50)"
          trend="Requires action"
          trendType="down"
          subtitle="Review today"
        ></app-stat-card>

        <app-stat-card
          title="Monthly Payroll"
          [value]="formattedPayrollBudget()"
          icon="dollar-sign"
          accentColor="var(--accent-purple)"
          iconBg="rgba(139, 92, 246, 0.1)"
          trend="Processed on-time"
          trendType="up"
          subtitle="Next cycle in 12 days"
        ></app-stat-card>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="grid-dashboard">
        <!-- Left Column: Department Breakdown & Today's Attendance Feed -->
        <div class="dash-column left-column">
          <!-- Department Distribution -->
          <div class="card">
            <div class="card-header-flex">
              <div>
                <h3 class="card-title">Department Headcount</h3>
                <span class="card-sub">Resource allocation across business units</span>
              </div>
              <span class="badge badge-primary">{{ departments().length }} Depts</span>
            </div>

            <div class="dept-list">
              @for (dept of departments(); track dept.id) {
                <div class="dept-item">
                  <div class="dept-info">
                    <div class="dept-name-box">
                      <span class="dept-color-bar" [style.background]="dept.color"></span>
                      <span class="dept-name">{{ dept.name }}</span>
                    </div>
                    <span class="dept-count">{{ dept.totalEmployees }} members ({{ getDeptPercentage(dept.totalEmployees) }}%)</span>
                  </div>
                  <div class="dept-progress-track">
                    <div class="dept-progress-bar" [style.width.%]="getDeptPercentage(dept.totalEmployees)" [style.background]="dept.color"></div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Real-Time Attendance Roster Preview -->
          <div class="card">
            <div class="card-header-flex">
              <div>
                <h3 class="card-title">Live Attendance Roster (Today)</h3>
                <span class="card-sub">Real-time punch activity of staff</span>
              </div>
              <a routerLink="/attendance" class="btn btn-sm btn-outline">View All Logs</a>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (record of todayAttendance().slice(0, 5); track record.id) {
                    <tr>
                      <td>
                        <div class="flex-align gap-2">
                          <div class="avatar avatar-sm">{{ record.employeeName[0] }}</div>
                          <span class="font-bold">{{ record.employeeName }}</span>
                        </div>
                      </td>
                      <td><span class="font-mono">{{ record.clockIn }}</span></td>
                      <td><span class="font-mono">{{ record.clockOut || '--:--' }}</span></td>
                      <td>
                        <app-badge [variant]="getAttendanceBadgeVariant(record.status)" [label]="record.status"></app-badge>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column: Quick Approvals, Upcoming Holidays & Announcements -->
        <div class="dash-column right-column">
          <!-- Pending Leave Approvals Action Card -->
          <div class="card leave-action-card">
            <div class="card-header-flex">
              <div>
                <h3 class="card-title">Pending Leave Requests</h3>
                <span class="card-sub">Requests awaiting your approval</span>
              </div>
              <a routerLink="/leaves" class="btn btn-sm btn-secondary">Manage</a>
            </div>

            <div class="leave-requests-list">
              @if (pendingLeaves().length === 0) {
                <div class="empty-state-card">
                  <app-icon name="check-circle" [size]="32"></app-icon>
                  <p>All leave requests have been reviewed!</p>
                </div>
              } @else {
                @for (leave of pendingLeaves(); track leave.id) {
                  <div class="leave-request-card">
                    <div class="req-header">
                      <div class="flex-align gap-2">
                        <div class="avatar avatar-sm">{{ leave.employeeName[0] }}</div>
                        <div>
                          <div class="req-name">{{ leave.employeeName }}</div>
                          <div class="req-dept">{{ leave.department }} • {{ leave.leaveType }}</div>
                        </div>
                      </div>
                      <span class="badge badge-warning">{{ leave.totalDays }} Days</span>
                    </div>
                    <div class="req-reason">"{{ leave.reason }}"</div>
                    <div class="req-footer">
                      <span class="req-dates">{{ leave.startDate }} to {{ leave.endDate }}</span>
                      <div class="req-actions">
                        <button class="btn btn-sm btn-success" (click)="approveLeave(leave.id)">Approve</button>
                        <button class="btn btn-sm btn-danger" (click)="rejectLeave(leave.id)">Reject</button>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>
          </div>

          <!-- Upcoming Holidays -->
          <div class="card">
            <div class="card-header-flex">
              <div>
                <h3 class="card-title">Upcoming Holidays</h3>
                <span class="card-sub">Company statutory holiday calendar</span>
              </div>
              <app-icon name="calendar" [size]="20"></app-icon>
            </div>

            <div class="holiday-list">
              @for (holiday of holidays().slice(0, 4); track holiday.id) {
                <div class="holiday-item">
                  <div class="holiday-date-badge">
                    <span class="h-month">{{ getMonthAbbr(holiday.date) }}</span>
                    <span class="h-day">{{ getDayNum(holiday.date) }}</span>
                  </div>
                  <div class="holiday-info">
                    <div class="holiday-name">{{ holiday.name }}</div>
                    <div class="holiday-sub">{{ holiday.day }} • {{ holiday.type }} Holiday</div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .welcome-hero {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08));
      border: 1px solid rgba(99, 102, 241, 0.25);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 1.75rem 2rem;
      flex-wrap: wrap;

      .hero-badge {
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--primary-600);
        margin-bottom: 0.375rem;
        display: inline-block;
      }

      .hero-title {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;
      }

      .hero-subtitle {
        color: var(--text-muted);
        font-size: 0.9375rem;
        margin-top: 0.25rem;
      }

      .hero-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
    }

    .stats-grid {
      margin-bottom: 0.5rem;
    }

    .grid-dashboard {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 1.5rem;

      @media (max-width: 1080px) {
        grid-template-columns: 1fr;
      }
    }

    .dash-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .card-header-flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;

      .card-title {
        font-size: 1.0625rem;
        font-weight: 700;
        color: var(--text-main);
      }
      .card-sub {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }

    /* Dept List */
    .dept-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .dept-item {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;

      .dept-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.8125rem;

        .dept-name-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--text-main);

          .dept-color-bar {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }
        }

        .dept-count {
          color: var(--text-muted);
          font-weight: 500;
        }
      }

      .dept-progress-track {
        height: 6px;
        background: var(--bg-surface-subtle);
        border-radius: var(--radius-full);
        overflow: hidden;

        .dept-progress-bar {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.6s ease;
        }
      }
    }

    /* Leave Request Cards */
    .leave-requests-list {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .leave-request-card {
      background: var(--bg-surface-subtle);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;

      .req-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .req-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .req-dept {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      }

      .req-reason {
        font-size: 0.8125rem;
        color: var(--text-main);
        font-style: italic;
        background: var(--bg-surface);
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius-sm);
      }

      .req-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .req-dates {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .req-actions {
          display: flex;
          gap: 0.5rem;
        }
      }
    }

    .empty-state-card {
      text-align: center;
      padding: 2rem 1rem;
      color: var(--success-600);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
    }

    /* Holidays */
    .holiday-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .holiday-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: var(--radius-md);
      background: var(--bg-surface-subtle);

      .holiday-date-badge {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        background: var(--primary-50);
        color: var(--primary-600);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        line-height: 1.1;

        .h-month {
          font-size: 0.625rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        .h-day {
          font-size: 1rem;
          font-weight: 800;
        }
      }

      .holiday-info {
        .holiday-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .holiday-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      }
    }

    .font-mono { font-family: var(--font-mono); }
    .font-bold { font-weight: 600; }
  `]
})
export class DashboardComponent {
  private readonly hrmsData = inject(HrmsDataService);
  readonly authService = inject(AuthService);

  readonly totalEmployees = this.hrmsData.totalEmployees;
  readonly presentToday = this.hrmsData.presentTodayCount;
  readonly pendingLeaves = this.hrmsData.pendingLeaveRequests;
  readonly departments = this.hrmsData.departments;
  readonly todayAttendance = this.hrmsData.todayAttendance;
  readonly holidays = this.hrmsData.holidays;
  readonly companies = this.hrmsData.companies;

  readonly formattedPayrollBudget = computed(() => {
    const amount = this.hrmsData.totalPayrollBudget();
    return '₹' + (amount / 100000).toFixed(1) + ' Lakhs';
  });

  getDeptPercentage(count: number): number {
    const total = this.totalEmployees();
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }

  getAttendanceBadgeVariant(status: string): any {
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Half Day': return 'warning';
      case 'Absent': return 'danger';
      case 'On Leave': return 'info';
      default: return 'neutral';
    }
  }

  approveLeave(id: string): void {
    this.hrmsData.updateLeaveStatus(id, 'Approved');
  }

  rejectLeave(id: string): void {
    this.hrmsData.updateLeaveStatus(id, 'Rejected');
  }

  getMonthAbbr(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { month: 'short' });
  }

  getDayNum(dateStr: string): string {
    const d = new Date(dateStr);
    return d.getDate().toString();
  }
}
