import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { RoleApiService } from '../../core/services/role-api.service';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RoleDto } from '../../core/models/role.model';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, IconComponent],
  template: `
    <div class="roles-container">
      <!-- Super Admin Verification Banner -->
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-left">
            <div class="header-badge">
              <span class="pulse-dot"></span>
              <span>SUPER ADMIN SECURITY SCOPE</span>
            </div>
            <h1 class="page-title">Enterprise Role Management</h1>
            <p class="page-subtitle">
              Manage system permissions, create custom organizational roles, and enforce security policies.
            </p>
          </div>
          <div class="header-actions">
            <button type="button" class="btn btn-secondary" (click)="refreshRoles()" [disabled]="roleApi.isLoading()">
              <app-icon name="clock" [size]="16"></app-icon>
              <span>{{ roleApi.isLoading() ? 'Syncing...' : 'Sync Roles' }}</span>
            </button>

            <button type="button" class="btn btn-primary" (click)="openCreateModal()">
              <app-icon name="plus" [size]="16"></app-icon>
              <span>Create New Role</span>
            </button>
          </div>
        </div>
        <!-- Security & Status Info Strip -->
        <div class="status-banner">
          <div class="status-left">
            <div class="shield-badge">
              <app-icon name="shield" [size]="20"></app-icon>
            </div>
          </div>
          <span class="badge badge-primary font-mono">STRICT VALIDATION ON</span>
        </div>

        <!-- Stat Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon bg-indigo">
              <app-icon name="shield" [size]="22"></app-icon>
            </div>
            <div class="stat-info">
              <span class="stat-label">Total Defined Roles</span>
              <span class="stat-value">{{ rolesCount() }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bg-emerald">
              <app-icon name="check-circle" [size]="22"></app-icon>
            </div>
            <div class="stat-info">
              <span class="stat-label">System Master Roles</span>
              <span class="stat-value">{{ systemRolesCount() }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bg-purple">
              <app-icon name="award" [size]="22"></app-icon>
            </div>
            <div class="stat-info">
              <span class="stat-label">Custom Roles</span>
              <span class="stat-value">{{ customRolesCount() }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bg-amber">
              <app-icon name="users" [size]="22"></app-icon>
            </div>
            <div class="stat-info">
              <span class="stat-label">Total Active Assignments</span>
              <span class="stat-value">{{ totalUserAssignments() }}</span>
            </div>
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div class="table-controls card">
          <div class="search-box">
            <app-icon name="search" [size]="18"></app-icon>
            <input 
              type="text" 
              class="form-control search-input" 
              placeholder="Search by role code (e.g. ROLE_FINANCE), display name, or description..."
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)"
            />
            @if (searchQuery()) {
              <button class="clear-btn" (click)="searchQuery.set('')">
                <app-icon name="x" [size]="14"></app-icon>
              </button>
            }
          </div>

          <div class="filter-actions">
            <button 
              type="button" 
              class="btn-filter" 
              [class.active]="filterType() === 'all'" 
              (click)="filterType.set('all')">
              All Roles ({{ rolesCount() }})
            </button>
            <button 
              type="button" 
              class="btn-filter" 
              [class.active]="filterType() === 'system'" 
              (click)="filterType.set('system')">
              System Roles ({{ systemRolesCount() }})
            </button>
            <button 
              type="button" 
              class="btn-filter" 
              [class.active]="filterType() === 'custom'" 
              (click)="filterType.set('custom')">
              Custom Roles ({{ customRolesCount() }})
            </button>
          </div>
        </div>

        <!-- Roles Table -->
        <div class="table-card card">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Role Code (Name)</th>
                  <th>Display Name</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Security Level</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (role of filteredRoles(); track role.name) {
                  <tr>
                    <td>
                      <div class="role-code-cell">
                        <span class="role-icon">
                          <app-icon [name]="role.isSystemRole ? 'shield' : 'award'" [size]="16"></app-icon>
                        </span>
                        <code class="role-code-tag">{{ role.name }}</code>
                      </div>
                    </td>
                    <td>
                      <span class="role-display-name">{{ role.displayName }}</span>
                    </td>
                    <td>
                      <p class="role-desc">{{ role.description || 'No description provided.' }}</p>
                    </td>
                    <td>
                      @if (role.isSystemRole) {
                        <span class="badge badge-primary">System Standard</span>
                      } @else {
                        <span class="badge badge-success">Custom Enterprise</span>
                      }
                    </td>
                    <td>
                      <span class="badge badge-neutral">
                        {{ role.name.includes('ADMIN') ? 'Full Administrative' : (role.name.includes('MANAGER') ? 'Departmental' : 'Staff Level') }}
                      </span>
                    </td>
                    <td class="text-right">
                      <button 
                        type="button" 
                        class="btn-action-icon" 
                        (click)="fillFromRole(role)" 
                        title="Use as template for new role">
                        <app-icon name="plus-circle" [size]="16"></app-icon>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="text-center py-5">
                      <div class="empty-state">
                        <app-icon name="shield" [size]="36"></app-icon>
                        <h4>No matching roles found</h4>
                        <p>Try refining your search keyword or create a new custom role.</p>
                        <button type="button" class="btn btn-primary btn-sm mt-3" (click)="openCreateModal()">
                          <app-icon name="plus" [size]="14"></app-icon>
                          <span>Create First Custom Role</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      

      <!-- Create Role Modal -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeCreateModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-icon-badge bg-primary">
                <app-icon name="shield" [size]="22"></app-icon>
              </div>
              <div class="modal-title-box">
                <h3>Create New Enterprise Role</h3>
                <p>POST to <code>http://localhost:8080/api/v1/role</code> (Super Admin Only)</p>
              </div>
              <button type="button" class="btn-modal-close" (click)="closeCreateModal()">
                <app-icon name="x" [size]="18"></app-icon>
              </button>
            </div>

            <!-- Quick Template Suggestions -->
            <div class="suggestions-bar">
              <span class="sugg-label">QUICK TEMPLATES:</span>
              <div class="sugg-chips">
                <button type="button" class="sugg-chip" (click)="applyTemplate('ROLE_FINANCE_MANAGER', 'Finance Manager', 'Full control over company budgeting, payroll approvals, and fiscal ledger.')">
                  + Finance Manager
                </button>
                <button type="button" class="sugg-chip" (click)="applyTemplate('ROLE_COMPLIANCE_LEAD', 'Compliance Lead', 'Regulatory auditing, statutory filings, and legal workplace compliance.')">
                  + Compliance Lead
                </button>
                <button type="button" class="sugg-chip" (click)="applyTemplate('ROLE_OPERATIONS_HEAD', 'Operations Head', 'Supervises facilities, shift schedules, and operational attendance.')">
                  + Operations Head
                </button>
                <button type="button" class="sugg-chip" (click)="applyTemplate('ROLE_TALENT_ACQUISITION', 'Talent Acquisition Specialist', 'Manages job vacancies, candidate interviews, and onboarding pipelines.')">
                  + Talent Acquisition
                </button>
              </div>
            </div>

            <form [formGroup]="roleForm" (ngSubmit)="onSubmitRole()" class="modal-form">
              <!-- Display Name Input -->
              <div class="form-group">
                <label class="required">Role Display Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  formControlName="displayName" 
                  (input)="onDisplayNameChange()"
                  placeholder="e.g. Finance Manager"
                  maxlength="150"
                />
                <span class="field-hint">User-friendly role title shown across dashboards and directory (max 150 characters).</span>
                @if (roleForm.get('displayName')?.touched && roleForm.get('displayName')?.invalid) {
                  <span class="form-error">Role display name is required (max 150 chars).</span>
                }
              </div>

              <!-- Role Code Name Input -->
              <div class="form-group">
                <div class="flex-between">
                  <label class="required">Role Name Code</label>
                  <button type="button" class="btn-text-action" (click)="formatToUpperCase()">
                    Force Uppercase
                  </button>
                </div>
                <div class="input-icon-wrapper">
                  <span class="input-icon font-mono font-bold">#</span>
                  <input 
                    type="text" 
                    class="form-control font-mono" 
                    formControlName="name" 
                    (input)="onNameInput($event)"
                    placeholder="e.g. ROLE_FINANCE_MANAGER or FINANCE_MANAGER"
                    maxlength="100"
                  />
                </div>
                <span class="field-hint">
                  Must be uppercase alphanumeric & underscores (Pattern: <code>^[A-Z0-9_]+$</code>, 2-100 characters).
                </span>
                @if (roleForm.get('name')?.touched && roleForm.get('name')?.errors?.['pattern']) {
                  <span class="form-error">Role name must contain ONLY uppercase letters, numbers, and underscores (e.g. 'ROLE_FINANCE_MANAGER').</span>
                }
                @if (roleForm.get('name')?.touched && (roleForm.get('name')?.errors?.['required'] || roleForm.get('name')?.errors?.['minlength'])) {
                  <span class="form-error">Role name code is required (min 2, max 100 characters).</span>
                }
              </div>

              <!-- Description Input -->
              <div class="form-group">
                <div class="flex-between">
                  <label>Role Description</label>
                  <span class="char-count" [class.warn]="remainingChars() < 50">
                    {{ remainingChars() }} chars left
                  </span>
                </div>
                <textarea 
                  class="form-control" 
                  formControlName="description" 
                  rows="3" 
                  maxlength="500"
                  placeholder="Describe the scope, permissions, and responsibilities associated with this role...">
                </textarea>
                <span class="field-hint">Detailed explanation of permissions (max 500 characters).</span>
              </div>

              <!-- Live Badge Preview -->
              <div class="preview-box">
                <span class="preview-title">Live Security Preview:</span>
                <div class="preview-content">
                  <span class="preview-code font-mono">{{ roleForm.get('name')?.value || 'ROLE_CODE' }}</span>
                  <span class="preview-arrow">→</span>
                  <span class="preview-name">{{ roleForm.get('displayName')?.value || 'Role Display Name' }}</span>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeCreateModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="roleForm.invalid || roleApi.isSaving()">
                  <app-icon name="check" [size]="16"></app-icon>
                  <span>{{ roleApi.isSaving() ? 'Saving Role...' : 'Save & Publish Role' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .roles-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .access-denied-card {
      text-align: center;
      padding: 4rem 2rem;
      margin: 2rem auto;
      max-width: 500px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .denied-icon {
        width: 80px;
        height: 80px;
        border-radius: var(--radius-full);
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger-500);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-main);
      }

      p {
        color: var(--text-muted);
        margin-top: 0.5rem;
        font-size: 0.875rem;
      }
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;

      .header-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.625rem;
        border-radius: var(--radius-full);
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.25);
        color: var(--primary-600);
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary-500);
          box-shadow: 0 0 8px var(--primary-500);
        }
      }

      .page-title {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;
      }

      .page-subtitle {
        font-size: 0.875rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
      }
    }

    .status-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1.25rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-left: 4px solid var(--primary-500);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);

      .status-left {
        display: flex;
        align-items: center;
        gap: 0.875rem;

        .shield-badge {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary-600);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-text {
          display: flex;
          flex-direction: column;

          .status-heading {
            font-size: 0.8125rem;
            font-weight: 700;
            color: var(--text-main);

            code {
              font-family: var(--font-mono);
              color: var(--primary-600);
              background: rgba(99, 102, 241, 0.08);
              padding: 0.1rem 0.35rem;
              border-radius: var(--radius-sm);
            }
          }

          .status-caption {
            font-size: 0.75rem;
            color: var(--text-muted);
          }
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;

      @media (max-width: 992px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 550px) {
        grid-template-columns: 1fr;
      }

      .stat-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: var(--shadow-sm);

        .stat-icon {
          width: 46px;
          height: 46px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;

          &.bg-indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); }
          &.bg-emerald { background: linear-gradient(135deg, #10b981, #059669); }
          &.bg-purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
          &.bg-amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
        }

        .stat-info {
          display: flex;
          flex-direction: column;

          .stat-label {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .stat-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--text-main);
            margin-top: 0.15rem;
          }
        }
      }
    }

    .table-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem;
      flex-wrap: wrap;

      .search-box {
        flex: 1;
        min-width: 280px;
        position: relative;
        display: flex;
        align-items: center;

        app-icon {
          position: absolute;
          left: 0.875rem;
          color: var(--text-subtle);
          pointer-events: none;
        }

        .search-input {
          padding-left: 2.5rem;
          padding-right: 2.25rem;
          width: 100%;
        }

        .clear-btn {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--text-subtle);
          cursor: pointer;
          padding: 0.25rem;
          &:hover { color: var(--text-main); }
        }
      }

      .filter-actions {
        display: flex;
        gap: 0.5rem;

        .btn-filter {
          padding: 0.5rem 0.875rem;
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid var(--border-color);
          background: var(--bg-surface-subtle);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);

          &:hover {
            background: var(--bg-surface);
            color: var(--text-main);
          }

          &.active {
            background: var(--primary-600);
            color: #ffffff;
            border-color: var(--primary-600);
          }
        }
      }
    }

    .table-card {
      padding: 0;
      overflow: hidden;

      .table {
        width: 100%;
        border-collapse: collapse;

        th {
          background: var(--bg-surface-subtle);
          padding: 0.875rem 1.25rem;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-color);
          text-align: left;
        }

        td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.8125rem;
          vertical-align: middle;
        }

        tbody tr {
          transition: background var(--transition-fast);
          &:hover { background: var(--bg-surface-subtle); }
          &:last-child td { border-bottom: none; }
        }
      }

      .role-code-cell {
        display: flex;
        align-items: center;
        gap: 0.625rem;

        .role-icon {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-md);
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary-600);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .role-code-tag {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.8125rem;
          color: var(--primary-700);
          background: rgba(99, 102, 241, 0.08);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
      }

      .role-display-name {
        font-weight: 700;
        color: var(--text-main);
      }

      .role-desc {
        color: var(--text-muted);
        font-size: 0.75rem;
        margin: 0;
        max-width: 400px;
        line-height: 1.4;
      }

      .btn-action-icon {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.35rem;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);

        &:hover {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary-600);
        }
      }
    }

    /* Modal Overlay & Form */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 620px;
      box-shadow: var(--shadow-xl);
      overflow: hidden;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);

      .modal-icon-badge {
        width: 42px;
        height: 42px;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        background: linear-gradient(135deg, var(--primary-600), var(--accent-purple));
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        flex-shrink: 0;
      }

      .modal-title-box {
        flex: 1;

        h3 {
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }

        p {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0.15rem 0 0 0;

          code {
            font-family: var(--font-mono);
            color: var(--primary-600);
          }
        }
      }

      .btn-modal-close {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.35rem;
        border-radius: var(--radius-sm);
        &:hover { color: var(--text-main); }
      }
    }

    .suggestions-bar {
      padding: 0.75rem 1.5rem;
      background: var(--bg-surface-subtle);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      overflow-x: auto;

      .sugg-label {
        font-size: 0.625rem;
        font-weight: 800;
        color: var(--text-muted);
        letter-spacing: 0.05em;
        flex-shrink: 0;
      }

      .sugg-chips {
        display: flex;
        gap: 0.375rem;
        flex-wrap: nowrap;

        .sugg-chip {
          white-space: nowrap;
          padding: 0.25rem 0.5rem;
          font-size: 0.6875rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          cursor: pointer;
          transition: all var(--transition-fast);

          &:hover {
            border-color: var(--primary-400);
            color: var(--primary-600);
            background: rgba(99, 102, 241, 0.06);
          }
        }
      }
    }

    .modal-form {
      padding: 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.125rem;

      .field-hint {
        font-size: 0.6875rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
        display: block;

        code { font-family: var(--font-mono); }
      }

      .form-error {
        font-size: 0.75rem;
        color: var(--danger-600);
        margin-top: 0.25rem;
        display: block;
        font-weight: 600;
      }

      .char-count {
        font-size: 0.6875rem;
        color: var(--text-muted);
        &.warn { color: var(--warning-600); }
      }

      .btn-text-action {
        background: transparent;
        border: none;
        font-size: 0.6875rem;
        color: var(--primary-600);
        font-weight: 600;
        cursor: pointer;
        &:hover { text-decoration: underline; }
      }

      .preview-box {
        padding: 0.875rem;
        background: rgba(99, 102, 241, 0.06);
        border: 1px solid rgba(99, 102, 241, 0.18);
        border-radius: var(--radius-md);

        .preview-title {
          font-size: 0.6875rem;
          font-weight: 700;
          color: var(--primary-700);
          display: block;
          margin-bottom: 0.35rem;
        }

        .preview-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .preview-code {
            font-size: 0.8125rem;
            font-weight: 700;
            color: var(--primary-600);
            background: rgba(99, 102, 241, 0.12);
            padding: 0.2rem 0.5rem;
            border-radius: var(--radius-sm);
          }

          .preview-arrow {
            color: var(--text-muted);
            font-size: 0.75rem;
          }

          .preview-name {
            font-size: 0.8125rem;
            font-weight: 700;
            color: var(--text-main);
          }
        }
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
        margin-top: 0.5rem;
      }
    }

    .font-mono { font-family: var(--font-mono); }
  `]
})
export class RoleManagementComponent implements OnInit {
  readonly roleApi = inject(RoleApiService);
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly searchQuery = signal<string>('');
  readonly filterType = signal<'all' | 'system' | 'custom'>('all');
  readonly showCreateModal = signal<boolean>(false);

  roleForm!: FormGroup;

  readonly isSuperAdmin = computed(() => {
    return this.authService.currentUser()?.role === 'Super Admin';
  });

  readonly rolesCount = computed(() => this.roleApi.roles().length);
  readonly systemRolesCount = computed(() => this.roleApi.roles().filter(r => r.isSystemRole).length);
  readonly customRolesCount = computed(() => this.roleApi.roles().filter(r => !r.isSystemRole).length);
  readonly totalUserAssignments = computed(() => {
    return this.roleApi.roles().reduce((sum, r) => sum + (r.userCount || 0), 0);
  });

  readonly filteredRoles = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.filterType();

    return this.roleApi.roles().filter(role => {
      // Type filter
      if (filter === 'system' && !role.isSystemRole) return false;
      if (filter === 'custom' && role.isSystemRole) return false;

      // Search query match
      if (!query) return true;
      return (
        role.name.toLowerCase().includes(query) ||
        role.displayName.toLowerCase().includes(query) ||
        (role.description && role.description.toLowerCase().includes(query))
      );
    });
  });

  readonly remainingChars = computed(() => {
    const desc = this.roleForm?.get('description')?.value || '';
    return 500 - desc.length;
  });

  ngOnInit(): void {
    this.initForm();
    this.roleApi.getRoles().subscribe();
  }

  private initForm(): void {
    this.roleForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(/^[A-Z0-9_]+$/)
        ]
      ],
      displayName: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],
      description: [
        '',
        [
          Validators.maxLength(500)
        ]
      ]
    });
  }

  openCreateModal(): void {
    this.roleForm.reset({
      name: '',
      displayName: '',
      description: ''
    });
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  refreshRoles(): void {
    this.roleApi.getRoles().subscribe();
  }

  onDisplayNameChange(): void {
    const disp = this.roleForm.get('displayName')?.value || '';
    const currentName = this.roleForm.get('name')?.value;

    // Auto-generate code if empty or pristine
    if (disp && (!currentName || this.roleForm.get('name')?.pristine)) {
      const generatedCode = 'ROLE_' + disp
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_');
      this.roleForm.patchValue({ name: generatedCode }, { emitEvent: false });
    }
  }

  onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      const upper = input.value.toUpperCase().replace(/\s+/g, '_');
      if (input.value !== upper) {
        this.roleForm.patchValue({ name: upper }, { emitEvent: false });
      }
    }
  }

  formatToUpperCase(): void {
    const current = this.roleForm.get('name')?.value || '';
    this.roleForm.patchValue({
      name: current.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
    });
  }

  applyTemplate(name: string, displayName: string, description: string): void {
    this.roleForm.setValue({
      name,
      displayName,
      description
    });
    this.roleForm.markAsDirty();
  }

  fillFromRole(role: RoleDto): void {
    this.openCreateModal();
    this.applyTemplate(
      role.name.startsWith('ROLE_') ? role.name + '_COPY' : 'ROLE_' + role.name,
      role.displayName + ' (Copy)',
      role.description || ''
    );
  }

  onSubmitRole(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const val = this.roleForm.value;
    this.roleApi.createRole({
      name: val.name.trim().toUpperCase(),
      displayName: val.displayName.trim(),
      description: val.description?.trim() || ''
    }).subscribe({
      next: () => {
        this.closeCreateModal();
      }
    });
  }
}
