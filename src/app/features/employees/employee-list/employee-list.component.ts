import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HrmsDataService } from '../../../core/services/hrms-data.service';
import { Employee } from '../../../core/models/employee.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { EmployeeFormModalComponent } from '../employee-form-modal/employee-form-modal.component';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, BadgeComponent, EmployeeFormModalComponent],
  template: `
    <div class="employee-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-titles">
          <h1>Employee Directory</h1>
          <p>Manage employee records, organizational departments, roles, and profiles.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-primary" (click)="openAddModal()">
            <app-icon name="plus" [size]="18"></app-icon>
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      <!-- Filters & Controls Bar -->
      <div class="filters-bar card">
        <div class="search-box">
          <div class="input-icon-wrapper">
            <span class="input-icon"><app-icon name="search" [size]="18"></app-icon></span>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search by name, role, email, or code..." 
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)"
            />
          </div>
        </div>

        <div class="filter-controls">
          <!-- Company Filter -->
          @if (authService.currentUser()?.role === 'Super Admin') {
            <div class="select-filter">
              <select class="form-control" [ngModel]="selectedCompanyId()" (ngModelChange)="selectedCompanyId.set($event)">
                <option value="ALL">All Companies ({{ companies().length }})</option>
                @for (comp of companies(); track comp.id) {
                  <option [value]="comp.id">{{ comp.companyName }}</option>
                }
              </select>
            </div>
          } @else {
            <div class="current-company-badge-pill">
              <app-icon name="building" [size]="16"></app-icon>
              <span>{{ authService.currentUser()?.companyName || 'My Organization' }}</span>
            </div>
          }

          <!-- Department Filter -->
          <div class="select-filter">
            <select class="form-control" [ngModel]="selectedDepartment()" (ngModelChange)="selectedDepartment.set($event)">
              <option value="ALL">All Departments</option>
              @for (dept of departments(); track dept.id) {
                <option [value]="dept.name">{{ dept.name }}</option>
              }
            </select>
          </div>

          <!-- Status Filter -->
          <div class="select-filter">
            <select class="form-control" [ngModel]="selectedStatus()" (ngModelChange)="selectedStatus.set($event)">
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Probation">Probation</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          <!-- View Mode Toggle -->
          <div class="view-toggle">
            <button 
              type="button" 
              class="toggle-btn" 
              [class.active]="viewMode() === 'grid'" 
              (click)="viewMode.set('grid')"
              title="Grid View">
              <app-icon name="grid" [size]="18"></app-icon>
            </button>
            <button 
              type="button" 
              class="toggle-btn" 
              [class.active]="viewMode() === 'table'" 
              (click)="viewMode.set('table')"
              title="Table View">
              <app-icon name="list" [size]="18"></app-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Employee Content: Grid View -->
      @if (viewMode() === 'grid') {
        <div class="grid-3 employee-grid">
          @for (emp of filteredEmployees(); track emp.id) {
            <div class="card emp-card card-hover">
              <div class="emp-card-top">
                <div class="avatar avatar-lg">{{ emp.firstName[0] }}{{ emp.lastName[0] }}</div>
                <div class="emp-meta">
                  <span class="emp-code">{{ emp.employeeCode }}</span>
                  <app-badge [variant]="getStatusBadgeVariant(emp.status)" [label]="emp.status"></app-badge>
                </div>
              </div>

                <div class="emp-card-body">
                <div class="flex-between mb-1">
                  <h3 class="emp-name">{{ emp.firstName }} {{ emp.lastName }}</h3>
                </div>
                <div class="emp-company-tag">
                  <app-icon name="award" [size]="12"></app-icon>
                  <span>{{ emp.companyName }}</span>
                </div>
                <div class="emp-designation">{{ emp.designation }}</div>
                <div class="emp-dept-pill">
                  <app-icon name="building" [size]="14"></app-icon>
                  <span>{{ emp.department }}</span>
                </div>

                <div class="emp-contact-list">
                  <div class="contact-row">
                    <app-icon name="mail" [size]="14"></app-icon>
                    <span>{{ emp.email }}</span>
                  </div>
                  <div class="contact-row">
                    <app-icon name="phone" [size]="14"></app-icon>
                    <span>{{ emp.phone }}</span>
                  </div>
                  <div class="contact-row">
                    <app-icon name="map-pin" [size]="14"></app-icon>
                    <span>{{ emp.location }}</span>
                  </div>
                </div>
              </div>

              <div class="emp-card-footer">
                <a [routerLink]="['/employees', emp.id]" class="btn btn-secondary btn-sm flex-1">
                  <app-icon name="eye" [size]="16"></app-icon>
                  <span>View Details</span>
                </a>
                <button type="button" class="btn btn-secondary btn-icon btn-sm" (click)="openEditModal(emp)" title="Edit">
                  <app-icon name="edit" [size]="16"></app-icon>
                </button>
                <button type="button" class="btn btn-danger btn-icon btn-sm" (click)="deleteEmployee(emp)" title="Delete">
                  <app-icon name="trash" [size]="16"></app-icon>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Employee Content: Table View -->
      @if (viewMode() === 'table') {
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Company / Entity</th>
                <th>Employee Code</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Join Date</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (emp of filteredEmployees(); track emp.id) {
                <tr>
                  <td>
                    <div class="flex-align gap-3">
                      <div class="avatar avatar-sm">{{ emp.firstName[0] }}{{ emp.lastName[0] }}</div>
                      <div>
                        <a [routerLink]="['/employees', emp.id]" class="font-bold text-main">{{ emp.firstName }} {{ emp.lastName }}</a>
                        <div class="text-muted font-xs">{{ emp.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-sm badge-primary">{{ emp.companyName }}</span>
                  </td>
                  <td><span class="font-mono">{{ emp.employeeCode }}</span></td>
                  <td>{{ emp.department }}</td>
                  <td>{{ emp.designation }}</td>
                  <td class="font-mono font-bold">₹{{ emp.salary.toLocaleString() }}</td>
                  <td>
                    <app-badge [variant]="getStatusBadgeVariant(emp.status)" [label]="emp.status"></app-badge>
                  </td>
                  <td>{{ emp.joinDate }}</td>
                  <td>
                    <div class="flex-align gap-2 justify-end">
                      <a [routerLink]="['/employees', emp.id]" class="btn btn-secondary btn-icon btn-sm" title="View Profile">
                        <app-icon name="eye" [size]="16"></app-icon>
                      </a>
                      <button type="button" class="btn btn-secondary btn-icon btn-sm" (click)="openEditModal(emp)" title="Edit">
                        <app-icon name="edit" [size]="16"></app-icon>
                      </button>
                      <button type="button" class="btn btn-danger btn-icon btn-sm" (click)="deleteEmployee(emp)" title="Delete">
                        <app-icon name="trash" [size]="16"></app-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (filteredEmployees().length === 0) {
        <div class="empty-state card">
          <app-icon name="users" [size]="48"></app-icon>
          <h3>No employees matched</h3>
          <p>Try adjusting your search terms or department filters.</p>
        </div>
      }

      <!-- Add/Edit Employee Modal -->
      <app-employee-form-modal
        [isOpen]="isModalOpen()"
        [employeeToEdit]="selectedEmployeeToEdit()"
        (close)="isModalOpen.set(false)"
      ></app-employee-form-modal>
    </div>
  `,
  styles: [`
    .employee-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .filters-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      flex-wrap: wrap;

      .search-box {
        flex: 1;
        min-width: 260px;
      }

      .filter-controls {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;

        .current-company-badge-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.875rem;
          border-radius: var(--radius-md);
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          font-weight: 700;
          font-size: 0.8125rem;
        }
      }
    }

    .view-toggle {
      display: flex;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;

      .toggle-btn {
        padding: 0.5rem 0.75rem;
        background: var(--bg-surface);
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);

        &.active {
          background: var(--primary-500);
          color: #ffffff;
        }
      }
    }

    /* Grid Cards */
    .emp-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.25rem;

      .emp-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .emp-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.375rem;

          .emp-code {
            font-family: var(--font-mono);
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--text-subtle);
          }
        }
      }

      .emp-card-body {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;

        .emp-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .emp-designation {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--primary-600);
        }

        .emp-dept-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
          margin-bottom: 0.75rem;
        }

        .emp-contact-list {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          padding-top: 0.75rem;
          border-top: 1px dashed var(--border-color);

          .contact-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            color: var(--text-muted);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }

      .emp-card-footer {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-color);

        .flex-1 { flex: 1; }
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-muted);
    }

    .emp-company-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--primary-600);
      margin-bottom: 0.25rem;
    }

    .font-xs { font-size: 0.75rem; }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: var(--font-mono); }
    .text-main { color: var(--text-main); }
    .text-muted { color: var(--text-muted); }
    .justify-end { justify-content: flex-end; }
    .mb-1 { margin-bottom: 0.25rem; }
  `]
})
export class EmployeeListComponent {
  private readonly hrmsData = inject(HrmsDataService);
  readonly authService = inject(AuthService);
  private readonly toast = inject(NotificationService);

  readonly companies = this.hrmsData.companies;
  readonly employees = this.hrmsData.employees;
  readonly departments = this.hrmsData.departments;

  readonly searchQuery = signal<string>('');
  readonly selectedCompanyId = signal<string>(
    this.authService.currentUser()?.role === 'Super Admin' ? 'ALL' : (this.authService.currentUser()?.companyId || 'ALL')
  );
  readonly selectedDepartment = signal<string>('ALL');
  readonly selectedStatus = signal<string>('ALL');
  readonly viewMode = signal<'grid' | 'table'>('grid');

  readonly isModalOpen = signal<boolean>(false);
  readonly selectedEmployeeToEdit = signal<Employee | null>(null);

  readonly filteredEmployees = computed(() => {
    let list = this.employees();
    const query = this.searchQuery().toLowerCase().trim();
    const compId = this.selectedCompanyId();
    const dept = this.selectedDepartment();
    const status = this.selectedStatus();

    if (compId !== 'ALL') {
      list = list.filter(e => e.companyId === compId);
    }

    if (query) {
      list = list.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(query) ||
        e.employeeCode.toLowerCase().includes(query) ||
        e.email.toLowerCase().includes(query) ||
        e.designation.toLowerCase().includes(query) ||
        (e.companyName && e.companyName.toLowerCase().includes(query))
      );
    }

    if (dept !== 'ALL') {
      list = list.filter(e => e.department === dept);
    }

    if (status !== 'ALL') {
      list = list.filter(e => e.status === status);
    }

    return list;
  });

  getStatusBadgeVariant(status: string): any {
    switch (status) {
      case 'Active': return 'success';
      case 'On Leave': return 'warning';
      case 'Probation': return 'primary';
      case 'Terminated': return 'danger';
      default: return 'neutral';
    }
  }

  openAddModal(): void {
    this.selectedEmployeeToEdit.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(emp: Employee): void {
    this.selectedEmployeeToEdit.set(emp);
    this.isModalOpen.set(true);
  }

  deleteEmployee(emp: Employee): void {
    if (confirm(`Are you sure you want to remove ${emp.firstName} ${emp.lastName} from the organization?`)) {
      this.hrmsData.deleteEmployee(emp.id);
      this.toast.info('Employee Removed', `${emp.firstName} ${emp.lastName} was deleted.`);
    }
  }
}
