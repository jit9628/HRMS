import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HrmsDataService } from '../../../core/services/hrms-data.service';
import { Employee } from '../../../core/models/employee.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { EmployeeFormModalComponent } from '../employee-form-modal/employee-form-modal.component';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, BadgeComponent, EmployeeFormModalComponent],
  template: `
    @if (employee(); as emp) {
      <div class="employee-detail-page">
        <!-- Breadcrumbs & Back button -->
        <div class="detail-nav">
          <a routerLink="/employees" class="btn btn-secondary btn-sm">
            <app-icon name="chevron-left" [size]="16"></app-icon>
            <span>Back to Directory</span>
          </a>
        </div>

        <!-- Profile Hero Header -->
        <div class="profile-hero card">
          <div class="hero-left">
            <div class="avatar avatar-xl">{{ emp.firstName[0] }}{{ emp.lastName[0] }}</div>
            <div class="hero-info">
              <div class="flex-align gap-2">
                <h1 class="hero-name">{{ emp.firstName }} {{ emp.lastName }}</h1>
                <app-badge [variant]="getStatusBadgeVariant(emp.status)" [label]="emp.status"></app-badge>
              </div>
              <p class="hero-role">{{ emp.designation }} • {{ emp.department }}</p>
              <div class="hero-tags">
                <span class="tag-pill"><app-icon name="map-pin" [size]="14"></app-icon> {{ emp.location }}</span>
                <span class="tag-pill"><app-icon name="mail" [size]="14"></app-icon> {{ emp.email }}</span>
                <span class="tag-pill"><app-icon name="phone" [size]="14"></app-icon> {{ emp.phone }}</span>
              </div>
            </div>
          </div>

          <div class="hero-actions">
            <button type="button" class="btn btn-primary btn-sm" (click)="isEditModalOpen.set(true)">
              <app-icon name="edit" [size]="16"></app-icon>
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        <!-- Detail Tabs -->
        <div class="tabs-nav">
          <button class="tab-btn" [class.active]="activeTab() === 'overview'" (click)="activeTab.set('overview')">
            Overview
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'attendance'" (click)="activeTab.set('attendance')">
            Attendance Log
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'leaves'" (click)="activeTab.set('leaves')">
            Leaves & Absence
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'payroll'" (click)="activeTab.set('payroll')">
            Salary & Payslips
          </button>
        </div>

        <!-- Tab 1: Overview -->
        @if (activeTab() === 'overview') {
          <div class="grid-2 detail-grid">
            <!-- Job & Employment Info -->
            <div class="card">
              <h3 class="section-title">Employment Information</h3>
              <div class="info-table">
                <div class="info-row">
                  <span class="label">Employee ID</span>
                  <span class="val font-mono font-bold">{{ emp.id }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Employee Code</span>
                  <span class="val font-mono">{{ emp.employeeCode }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Department</span>
                  <span class="val">{{ emp.department }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Designation</span>
                  <span class="val">{{ emp.designation }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Employment Type</span>
                  <span class="val">{{ emp.employmentType }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Reporting Manager</span>
                  <span class="val">{{ emp.managerName || 'Executive Leadership' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Date of Joining</span>
                  <span class="val">{{ emp.joinDate }}</span>
                </div>
              </div>
            </div>

            <!-- Compensation & Bank Details -->
            <div class="card">
              <h3 class="section-title">Compensation & Banking</h3>
              <div class="info-table">
                <div class="info-row">
                  <span class="label">Monthly Base Gross</span>
                  <span class="val font-mono font-bold">₹{{ emp.salary.toLocaleString() }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Annual CTC</span>
                  <span class="val font-mono font-bold">₹{{ (emp.salary * 12).toLocaleString() }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Bank Name</span>
                  <span class="val">{{ emp.bankDetails?.bankName || 'HDFC Bank Ltd' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Account Number</span>
                  <span class="val font-mono">{{ emp.bankDetails?.accountNumber || '91802003891238' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">IFSC Code</span>
                  <span class="val font-mono">{{ emp.bankDetails?.ifscCode || 'HDFC0001234' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">PAN Number</span>
                  <span class="val font-mono">{{ emp.bankDetails?.pan || 'ABCDE1234F' }}</span>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Tab 2: Attendance -->
        @if (activeTab() === 'attendance') {
          <div class="card">
            <h3 class="section-title">Attendance Records</h3>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (rec of empAttendance(); track rec.id) {
                    <tr>
                      <td>{{ rec.date }}</td>
                      <td><span class="font-mono">{{ rec.clockIn }}</span></td>
                      <td><span class="font-mono">{{ rec.clockOut || '--:--' }}</span></td>
                      <td><span class="font-mono">{{ rec.workHours }} hrs</span></td>
                      <td><app-badge [variant]="rec.status === 'Present' ? 'success' : 'warning'" [label]="rec.status"></app-badge></td>
                    </tr>
                  }
                  @if (empAttendance().length === 0) {
                    <tr>
                      <td colspan="5" class="text-center text-muted">No attendance punches recorded yet.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Tab 3: Leaves -->
        @if (activeTab() === 'leaves') {
          <div class="card">
            <h3 class="section-title">Leave History</h3>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Date Range</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (lv of empLeaves(); track lv.id) {
                    <tr>
                      <td><strong>{{ lv.leaveType }}</strong></td>
                      <td>{{ lv.startDate }} to {{ lv.endDate }}</td>
                      <td>{{ lv.totalDays }}</td>
                      <td>{{ lv.reason }}</td>
                      <td><app-badge [variant]="lv.status === 'Approved' ? 'success' : 'warning'" [label]="lv.status"></app-badge></td>
                    </tr>
                  }
                  @if (empLeaves().length === 0) {
                    <tr>
                      <td colspan="5" class="text-center text-muted">No leave requests found.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Tab 4: Payslips -->
        @if (activeTab() === 'payroll') {
          <div class="card">
            <h3 class="section-title">Generated Payslips</h3>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Payroll Month</th>
                    <th>Gross Salary</th>
                    <th>Deductions</th>
                    <th>Net Take-Home</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (pay of empPayslips(); track pay.id) {
                    <tr>
                      <td><strong>{{ pay.payrollMonth }}</strong></td>
                      <td class="font-mono">₹{{ pay.grossEarnings.toLocaleString() }}</td>
                      <td class="font-mono text-danger">₹{{ pay.totalDeductions.toLocaleString() }}</td>
                      <td class="font-mono font-bold text-success">₹{{ pay.netSalary.toLocaleString() }}</td>
                      <td><app-badge variant="success" [label]="pay.paymentStatus"></app-badge></td>
                    </tr>
                  }
                  @if (empPayslips().length === 0) {
                    <tr>
                      <td colspan="5" class="text-center text-muted">No payslips generated for this employee yet.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Edit Modal -->
        <app-employee-form-modal
          [isOpen]="isEditModalOpen()"
          [employeeToEdit]="emp"
          (close)="isEditModalOpen.set(false)"
          (saved)="onEmployeeUpdated($event)"
        ></app-employee-form-modal>
      </div>
    } @else {
      <div class="card text-center p-6">
        <h2>Employee not found</h2>
        <p class="text-muted">The requested employee ID does not exist in records.</p>
        <a routerLink="/employees" class="btn btn-primary mt-4">Back to Directory</a>
      </div>
    }
  `,
  styles: [`
    .employee-detail-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .profile-hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 2rem;
      flex-wrap: wrap;

      .hero-left {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex-wrap: wrap;

        .hero-name {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .hero-role {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--primary-600);
          margin-top: 0.125rem;
        }

        .hero-tags {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;

          .tag-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.75rem;
            color: var(--text-muted);
            background: var(--bg-surface-subtle);
            padding: 0.25rem 0.625rem;
            border-radius: var(--radius-full);
          }
        }
      }
    }

    .section-title {
      font-size: 1.0625rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 1.25rem;
    }

    .info-table {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .info-row {
        display: flex;
        justify-content: space-between;
        padding-bottom: 0.625rem;
        border-bottom: 1px solid var(--border-color);
        font-size: 0.875rem;

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: var(--text-muted);
        }
        .val {
          color: var(--text-main);
        }
      }
    }

    .font-mono { font-family: var(--font-mono); }
    .font-bold { font-weight: 700; }
    .text-success { color: var(--success-600); }
    .text-danger { color: var(--danger-600); }
    .text-center { text-align: center; }
  `]
})
export class EmployeeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly hrmsData = inject(HrmsDataService);

  readonly employeeId = signal<string>('');
  readonly activeTab = signal<'overview' | 'attendance' | 'leaves' | 'payroll'>('overview');
  readonly isEditModalOpen = signal<boolean>(false);

  readonly employee = computed(() => {
    return this.hrmsData.getEmployeeById(this.employeeId());
  });

  readonly empAttendance = computed(() => {
    return this.hrmsData.attendanceRecords().filter(a => a.employeeId === this.employeeId());
  });

  readonly empLeaves = computed(() => {
    return this.hrmsData.leaveRequests().filter(l => l.employeeId === this.employeeId());
  });

  readonly empPayslips = computed(() => {
    return this.hrmsData.payslips().filter(p => p.employeeId === this.employeeId());
  });

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.employeeId.set(params['id']);
      }
    });
  }

  getStatusBadgeVariant(status: string): any {
    switch (status) {
      case 'Active': return 'success';
      case 'On Leave': return 'warning';
      case 'Probation': return 'primary';
      case 'Terminated': return 'danger';
      default: return 'neutral';
    }
  }

  onEmployeeUpdated(updated: Employee): void {
    this.employeeId.set(updated.id);
  }
}
