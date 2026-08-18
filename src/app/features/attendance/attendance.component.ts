import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrmsDataService } from '../../core/services/hrms-data.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent, StatCardComponent, ModalComponent],
  template: `
    <div class="attendance-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-titles">
          <h1>Attendance & Time Tracking</h1>
          <p>Monitor daily attendance logs, shift hours, and punch-in timelines.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-primary" (click)="isManualModalOpen.set(true)">
            <app-icon name="plus" [size]="18"></app-icon>
            <span>Log Manual Punch</span>
          </button>
        </div>
      </div>

      <!-- KPI Stats -->
      <div class="grid-4">
        <app-stat-card
          title="Present Today"
          [value]="presentCount()"
          icon="check-circle"
          accentColor="var(--success-500)"
          iconBg="var(--success-50)"
          trend="90% On Track"
          trendType="up"
        ></app-stat-card>

        <app-stat-card
          title="Late Arrivals"
          [value]="lateCount()"
          icon="clock"
          accentColor="var(--warning-500)"
          iconBg="var(--warning-50)"
          trend="> 9:30 AM"
          trendType="down"
        ></app-stat-card>

        <app-stat-card
          title="On Leave Today"
          [value]="onLeaveCount()"
          icon="calendar"
          accentColor="var(--info-500)"
          iconBg="var(--info-50)"
          subtitle="Approved leaves"
        ></app-stat-card>

        <app-stat-card
          title="Avg Shift Duration"
          value="8.8 hrs"
          icon="award"
          accentColor="var(--primary-500)"
          iconBg="var(--primary-50)"
          trend="+0.3 hrs vs last wk"
          trendType="up"
        ></app-stat-card>
      </div>

      <!-- Filters & Date Selection -->
      <div class="card filters-card">
        <div class="search-box">
          <div class="input-icon-wrapper">
            <span class="input-icon"><app-icon name="search" [size]="18"></app-icon></span>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search employee name or ID..."
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
            />
          </div>
        </div>

        <div class="filter-group">
          <select class="form-control" [ngModel]="selectedStatus()" (ngModelChange)="selectedStatus.set($event)">
            <option value="ALL">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Half Day">Half Day</option>
            <option value="On Leave">On Leave</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      <!-- Attendance Table -->
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Total Hours</th>
              <th>Status</th>
              <th>Notes / Remarks</th>
            </tr>
          </thead>
          <tbody>
            @for (rec of filteredRecords(); track rec.id) {
              <tr>
                <td>
                  <div class="flex-align gap-2">
                    <div class="avatar avatar-sm">{{ rec.employeeName[0] }}</div>
                    <div>
                      <div class="font-bold">{{ rec.employeeName }}</div>
                      <div class="text-muted font-xs">{{ rec.employeeId }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ rec.date }}</td>
                <td><span class="font-mono font-bold">{{ rec.clockIn }}</span></td>
                <td><span class="font-mono">{{ rec.clockOut || '--:--' }}</span></td>
                <td><span class="font-mono font-bold">{{ rec.workHours }} hrs</span></td>
                <td>
                  <app-badge [variant]="getAttendanceBadgeVariant(rec.status)" [label]="rec.status"></app-badge>
                </td>
                <td>
                  <span class="text-muted font-xs">{{ rec.notes || '-' }}</span>
                </td>
              </tr>
            }
            @if (filteredRecords().length === 0) {
              <tr>
                <td colspan="7" class="text-center text-muted p-4">No attendance records found matching filters.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Manual Log Modal -->
      <app-modal
        [isOpen]="isManualModalOpen()"
        title="Log Manual Attendance Punch"
        (close)="isManualModalOpen.set(false)">
        <div class="form-group">
          <label>Employee *</label>
          <select class="form-control" [(ngModel)]="manualLogEmpId">
            @for (emp of employees(); track emp.id) {
              <option [value]="emp.id">{{ emp.firstName }} {{ emp.lastName }} ({{ emp.employeeCode }})</option>
            }
          </select>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label>Date *</label>
            <input type="date" class="form-control" [(ngModel)]="manualLogDate" />
          </div>
          <div class="form-group">
            <label>Clock In Time *</label>
            <input type="time" class="form-control" [(ngModel)]="manualLogClockIn" />
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label>Clock Out Time</label>
            <input type="time" class="form-control" [(ngModel)]="manualLogClockOut" />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select class="form-control" [(ngModel)]="manualLogStatus">
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Reason / Notes</label>
          <input type="text" class="form-control" [(ngModel)]="manualLogNotes" placeholder="e.g. Forgot biometric card" />
        </div>

        <div modal-footer>
          <button type="button" class="btn btn-secondary" (click)="isManualModalOpen.set(false)">Cancel</button>
          <button type="button" class="btn btn-primary" (click)="saveManualPunch()">Save Record</button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .attendance-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .filters-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      flex-wrap: wrap;

      .search-box {
        flex: 1;
        min-width: 240px;
      }
    }

    .font-mono { font-family: var(--font-mono); }
    .font-bold { font-weight: 700; }
    .font-xs { font-size: 0.75rem; }
    .text-center { text-align: center; }
  `]
})
export class AttendanceComponent {
  private readonly hrmsData = inject(HrmsDataService);
  private readonly toast = inject(NotificationService);

  readonly records = this.hrmsData.attendanceRecords;
  readonly employees = this.hrmsData.employees;

  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('ALL');
  readonly isManualModalOpen = signal<boolean>(false);

  // Manual Punch Form State
  manualLogEmpId = 'EMP-1001';
  manualLogDate = new Date().toISOString().split('T')[0];
  manualLogClockIn = '09:00';
  manualLogClockOut = '18:00';
  manualLogStatus: any = 'Present';
  manualLogNotes = '';

  readonly presentCount = computed(() => {
    return this.records().filter(r => r.status === 'Present' || r.status === 'Late').length;
  });

  readonly lateCount = computed(() => {
    return this.records().filter(r => r.status === 'Late').length;
  });

  readonly onLeaveCount = computed(() => {
    return this.records().filter(r => r.status === 'On Leave').length;
  });

  readonly filteredRecords = computed(() => {
    let list = this.records();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();

    if (query) {
      list = list.filter(r =>
        r.employeeName.toLowerCase().includes(query) ||
        r.employeeId.toLowerCase().includes(query)
      );
    }

    if (status !== 'ALL') {
      list = list.filter(r => r.status === status);
    }

    return list;
  });

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

  saveManualPunch(): void {
    const emp = this.employees().find(e => e.id === this.manualLogEmpId);
    if (!emp) return;

    this.hrmsData.attendanceRecords.update(records => [
      {
        id: 'ATT-' + Date.now(),
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        date: this.manualLogDate,
        clockIn: this.manualLogClockIn,
        clockOut: this.manualLogClockOut,
        workHours: 8.5,
        status: this.manualLogStatus,
        notes: this.manualLogNotes
      },
      ...records
    ]);

    this.toast.success('Manual Punch Saved', `Attendance recorded for ${emp.firstName} ${emp.lastName}.`);
    this.isManualModalOpen.set(false);
  }
}
