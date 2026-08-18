import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrmsDataService } from '../../core/services/hrms-data.service';
import { LeaveType, LeaveRequest } from '../../core/models/leave.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent, ModalComponent],
  template: `
    <div class="leaves-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-titles">
          <h1>Leave & Absence Management</h1>
          <p>Track leave quotas, submit time-off requests, and manage manager approvals.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-primary" (click)="isApplyModalOpen.set(true)">
            <app-icon name="plus" [size]="18"></app-icon>
            <span>Request Time Off</span>
          </button>
        </div>
      </div>

      <!-- Leave Balance Cards -->
      <div class="grid-4">
        <div class="card balance-card">
          <div class="bal-header">
            <span class="bal-title">Casual Leave (CL)</span>
            <span class="badge badge-primary">Annual</span>
          </div>
          <div class="bal-counts">
            <span class="bal-available">08</span>
            <span class="bal-total">/ 12 Days Left</span>
          </div>
          <div class="bal-bar">
            <div class="bal-fill bg-primary" style="width: 66%;"></div>
          </div>
        </div>

        <div class="card balance-card">
          <div class="bal-header">
            <span class="bal-title">Sick Leave (SL)</span>
            <span class="badge badge-success">Medical</span>
          </div>
          <div class="bal-counts">
            <span class="bal-available">07</span>
            <span class="bal-total">/ 10 Days Left</span>
          </div>
          <div class="bal-bar">
            <div class="bal-fill bg-success" style="width: 70%;"></div>
          </div>
        </div>

        <div class="card balance-card">
          <div class="bal-header">
            <span class="bal-title">Paid / Earned Leave</span>
            <span class="badge badge-warning">Vacation</span>
          </div>
          <div class="bal-counts">
            <span class="bal-available">14</span>
            <span class="bal-total">/ 18 Days Left</span>
          </div>
          <div class="bal-bar">
            <div class="bal-fill bg-warning" style="width: 77%;"></div>
          </div>
        </div>

        <div class="card balance-card">
          <div class="bal-header">
            <span class="bal-title">Special & Bereavement</span>
            <span class="badge badge-neutral">Standard</span>
          </div>
          <div class="bal-counts">
            <span class="bal-available">05</span>
            <span class="bal-total">/ 05 Days Left</span>
          </div>
          <div class="bal-bar">
            <div class="bal-fill bg-info" style="width: 100%;"></div>
          </div>
        </div>
      </div>

      <!-- Leave Requests Section -->
      <div class="card">
        <div class="flex-between mb-4">
          <div>
            <h3 class="section-title">Leave Applications & Approval Workflow</h3>
            <p class="text-muted font-xs">Approve or reject pending employee leave applications</p>
          </div>
          
          <div class="status-filters">
            <button 
              type="button" 
              class="filter-pill" 
              [class.active]="filterStatus() === 'ALL'" 
              (click)="filterStatus.set('ALL')">
              All ({{ leaves().length }})
            </button>
            <button 
              type="button" 
              class="filter-pill" 
              [class.active]="filterStatus() === 'Pending'" 
              (click)="filterStatus.set('Pending')">
              Pending ({{ pendingCount() }})
            </button>
            <button 
              type="button" 
              class="filter-pill" 
              [class.active]="filterStatus() === 'Approved'" 
              (click)="filterStatus.set('Approved')">
              Approved
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Applied On</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (req of filteredLeaves(); track req.id) {
                <tr>
                  <td>
                    <div class="flex-align gap-2">
                      <div class="avatar avatar-sm">{{ req.employeeName[0] }}</div>
                      <div>
                        <div class="font-bold">{{ req.employeeName }}</div>
                        <div class="text-muted font-xs">{{ req.department }}</div>
                      </div>
                    </div>
                  </td>
                  <td><strong>{{ req.leaveType }}</strong></td>
                  <td>{{ req.startDate }} to {{ req.endDate }}</td>
                  <td><span class="badge badge-neutral">{{ req.totalDays }} Days</span></td>
                  <td><span class="reason-text">"{{ req.reason }}"</span></td>
                  <td>{{ req.appliedOn }}</td>
                  <td>
                    <app-badge [variant]="getStatusVariant(req.status)" [label]="req.status"></app-badge>
                  </td>
                  <td>
                    @if (req.status === 'Pending') {
                      <div class="flex-align gap-2 justify-end">
                        <button type="button" class="btn btn-sm btn-success" (click)="approve(req)">Approve</button>
                        <button type="button" class="btn btn-sm btn-danger" (click)="reject(req)">Reject</button>
                      </div>
                    } @else {
                      <span class="text-muted font-xs">{{ req.approverComments || 'Completed' }}</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Apply Leave Modal -->
      <app-modal
        [isOpen]="isApplyModalOpen()"
        title="Submit Time Off Request"
        (close)="isApplyModalOpen.set(false)">
        <div class="form-group">
          <label>Leave Type *</label>
          <select class="form-control" [(ngModel)]="newLeaveType">
            <option value="Casual Leave">Casual Leave (CL)</option>
            <option value="Sick Leave">Sick Leave (SL)</option>
            <option value="Paid Leave">Paid / Vacation Leave (PL)</option>
            <option value="Maternity / Paternity">Maternity / Paternity</option>
            <option value="Bereavement">Bereavement Leave</option>
          </select>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label>Start Date *</label>
            <input type="date" class="form-control" [(ngModel)]="newStartDate" />
          </div>
          <div class="form-group">
            <label>End Date *</label>
            <input type="date" class="form-control" [(ngModel)]="newEndDate" />
          </div>
        </div>

        <div class="form-group">
          <label>Reason for Leave *</label>
          <textarea class="form-control" rows="3" [(ngModel)]="newReason" placeholder="Please provide details for the requested leave..."></textarea>
        </div>

        <div modal-footer>
          <button type="button" class="btn btn-secondary" (click)="isApplyModalOpen.set(false)">Cancel</button>
          <button type="button" class="btn btn-primary" (click)="submitLeaveRequest()" [disabled]="!newReason.trim()">
            Submit Request
          </button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .leaves-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .balance-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .bal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .bal-title {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-main);
        }
      }

      .bal-counts {
        display: flex;
        align-items: baseline;
        gap: 0.375rem;

        .bal-available {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-main);
        }
        .bal-total {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }
      }

      .bal-bar {
        height: 6px;
        background: var(--bg-surface-subtle);
        border-radius: var(--radius-full);
        overflow: hidden;

        .bal-fill {
          height: 100%;
          border-radius: var(--radius-full);

          &.bg-primary { background: var(--primary-500); }
          &.bg-success { background: var(--success-500); }
          &.bg-warning { background: var(--warning-500); }
          &.bg-info { background: var(--accent-cyan); }
        }
      }
    }

    .status-filters {
      display: flex;
      gap: 0.5rem;

      .filter-pill {
        padding: 0.375rem 0.75rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 600;
        background: var(--bg-surface-subtle);
        color: var(--text-muted);
        border: 1px solid var(--border-color);
        transition: all var(--transition-fast);

        &.active {
          background: var(--primary-500);
          color: #ffffff;
          border-color: var(--primary-500);
        }
      }
    }

    .reason-text {
      font-size: 0.8125rem;
      color: var(--text-muted);
      max-width: 280px;
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .section-title { font-size: 1.0625rem; font-weight: 700; color: var(--text-main); }
    .font-bold { font-weight: 700; }
    .font-xs { font-size: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .justify-end { justify-content: flex-end; }
  `]
})
export class LeavesComponent {
  private readonly hrmsData = inject(HrmsDataService);
  private readonly toast = inject(NotificationService);

  readonly leaves = this.hrmsData.leaveRequests;
  readonly filterStatus = signal<string>('ALL');
  readonly isApplyModalOpen = signal<boolean>(false);

  // Form
  newLeaveType: LeaveType = 'Casual Leave';
  newStartDate = new Date().toISOString().split('T')[0];
  newEndDate = new Date().toISOString().split('T')[0];
  newReason = '';

  readonly pendingCount = computed(() => this.leaves().filter(l => l.status === 'Pending').length);

  readonly filteredLeaves = computed(() => {
    const status = this.filterStatus();
    if (status === 'ALL') return this.leaves();
    return this.leaves().filter(l => l.status === status);
  });

  getStatusVariant(status: string): any {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'danger';
      default: return 'neutral';
    }
  }

  approve(req: LeaveRequest): void {
    this.hrmsData.updateLeaveStatus(req.id, 'Approved', 'Approved by Manager');
    this.toast.success('Leave Approved', `${req.employeeName}'s leave has been approved.`);
  }

  reject(req: LeaveRequest): void {
    this.hrmsData.updateLeaveStatus(req.id, 'Rejected', 'Declined due to ongoing release sprint');
    this.toast.warning('Leave Declined', `${req.employeeName}'s leave was declined.`);
  }

  submitLeaveRequest(): void {
    const start = new Date(this.newStartDate);
    const end = new Date(this.newEndDate);
    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    this.hrmsData.applyLeave({
      employeeId: 'EMP-1001',
      employeeName: 'Jitendra Shukla',
      department: 'Engineering',
      leaveType: this.newLeaveType,
      startDate: this.newStartDate,
      endDate: this.newEndDate,
      totalDays: diffDays,
      reason: this.newReason
    });

    this.toast.success('Leave Request Submitted', 'Your manager has received your time-off request.');
    this.isApplyModalOpen.set(false);
    this.newReason = '';
  }
}
