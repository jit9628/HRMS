import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HrmsDataService } from '../../../core/services/hrms-data.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CompanyProfile, CompanyType, CompanyStatus } from '../../../core/models/company.model';
import { Department } from '../../../core/models/employee.model';
import { DepartmentApiService } from '../../../core/services/department-api.service';
import { CompanyApiService } from '../../../core/services/company-api.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, IconComponent, StatCardComponent, ModalComponent],
  template: `
    <div class="company-page">
      <!-- Admin Security Notice if not Admin -->
      @if (!isAdmin()) {
        <div class="card access-denied-card">
          <app-icon name="alert-circle" [size]="32"></app-icon>
          <div>
            <h3>Administrator Restricted Area</h3>
            <p>You are logged in as <strong>{{ authService.currentUser()?.name }}</strong> ({{ authService.currentUser()?.role }}). Only <strong>Administrator</strong> accounts have permissions to add, edit, or configure organization legal entities.</p>
          </div>
          <button type="button" class="btn btn-primary btn-sm" (click)="authService.quickLogin('Super Admin')">
            Switch to Administrator
          </button>
        </div>
      }

      <!-- Page Header -->
      <div class="page-header">
        <div class="header-titles">
          <div class="flex-align gap-2">
            <h1>Organization Entities & Companies</h1>
            <span class="badge badge-primary">Admin Control</span>
          </div>
          <p>Register, configure, and manage parent organizations, subsidiaries, regional branches, and company-specific departments.</p>
        </div>
        <div class="header-actions">
          <button 
            type="button" 
            class="btn btn-primary" 
            (click)="openAddModal()" 
            [disabled]="!isAdmin()">
            <app-icon name="plus" [size]="18"></app-icon>
            <span>Add New Company</span>
          </button>
        </div>
      </div>

      <!-- KPI Metrics -->
      <div class="grid-4">
        <app-stat-card
          title="Registered Entities"
          [value]="companies().length"
          icon="building"
          accentColor="var(--primary-500)"
          iconBg="var(--primary-50)"
          subtitle="Active corporate entities"
        ></app-stat-card>

        <app-stat-card
          title="Headquarters"
          [value]="hqCount()"
          icon="award"
          accentColor="var(--accent-purple)"
          iconBg="rgba(139, 92, 246, 0.1)"
          subtitle="Primary legal entity"
        ></app-stat-card>

        <app-stat-card
          title="Regional Branches"
          [value]="branchCount()"
          icon="map-pin"
          accentColor="var(--accent-sky)"
          iconBg="var(--info-50)"
          subtitle="Domestic branch offices"
        ></app-stat-card>

        <app-stat-card
          title="Total Departments"
          [value]="totalDepartmentsCount()"
          icon="briefcase"
          accentColor="var(--success-500)"
          iconBg="var(--success-50)"
          subtitle="Across all entities"
        ></app-stat-card>
      </div>

      <!-- Filter Controls Bar -->
      <div class="card filter-bar">
        <div class="search-box">
          <div class="input-icon-wrapper">
            <span class="input-icon"><app-icon name="search" [size]="18"></app-icon></span>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search companies by name, code, tax ID, or city..."
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
            />
          </div>
        </div>

        <div class="filter-group">
          <select class="form-control" [ngModel]="selectedType()" (ngModelChange)="selectedType.set($event)">
            <option value="ALL">All Entity Types</option>
            <option value="Headquarters">Headquarters</option>
            <option value="Regional Branch">Regional Branch</option>
            <option value="Subsidiary">Subsidiary</option>
            <option value="Sister Entity">Sister Entity</option>
          </select>
        </div>
      </div>

      <!-- Company Cards Grid -->
      <div class="grid-3 company-grid">
        @for (comp of filteredCompanies(); track comp.id) {
          <div class="card company-card card-hover" [class.is-default]="comp.isDefault">
            <div class="company-card-top">
              <div class="company-logo-box" [style.background]="comp.brandColor || 'var(--primary-600)'">
                <app-icon name="building" [size]="24"></app-icon>
              </div>

              <div class="company-tags">
                <span class="badge" [ngClass]="getTypeBadgeClass(comp.type)">{{ comp.type }}</span>
                @if (comp.isDefault) {
                  <span class="badge badge-success">⭐ Primary HQ</span>
                }
              </div>
            </div>

            <div class="company-card-body">
              <div class="company-code font-mono">{{ comp.code }}</div>
              <h3 class="company-name">{{ comp.companyName }}</h3>
              <p class="company-tagline">{{ comp.tagline || comp.industry }}</p>

              <div class="company-meta-list">
                <div class="meta-item">
                  <app-icon name="map-pin" [size]="14"></app-icon>
                  <span>{{ comp.city }}, {{ comp.state }} ({{ comp.country }})</span>
                </div>
                <div class="meta-item">
                  <app-icon name="mail" [size]="14"></app-icon>
                  <span>{{ comp.email }}</span>
                </div>
                <div class="meta-item font-mono">
                  <app-icon name="award" [size]="14"></app-icon>
                  <span>GST/Tax: {{ comp.taxId }}</span>
                </div>
              </div>

              <!-- 🏢 Company-Specific Departments Showcase -->
              <div class="company-depts-preview">
                <div class="flex-between mb-1">
                  <span class="depts-title">DEPARTMENTS ({{ getCompanyDepts(comp.id).length }}):</span>
                  <button 
                    type="button" 
                    class="btn-text-action" 
                    (click)="openManageDeptModal(comp)">
                    <app-icon name="plus" [size]="12"></app-icon>
                    <span>Add Dept</span>
                  </button>
                </div>

                <div class="dept-tags-wrap">
                  @for (dept of getCompanyDepts(comp.id); track dept.id) {
                    <span class="dept-tag-badge" [style.border-left-color]="dept.color">
                      {{ dept.name }} ({{ dept.code }})
                    </span>
                  } @empty {
                    <span class="no-depts-text">No custom departments yet. Click "+ Add Dept".</span>
                  }
                </div>
              </div>

              <div class="company-stats-pill">
                <div class="c-stat">
                  <span class="s-val">{{ comp.totalEmployees }}</span>
                  <span class="s-lbl">Employees</span>
                </div>
                <div class="c-stat-divider"></div>
                <div class="c-stat">
                  <span class="s-val">{{ getCompanyDepts(comp.id).length }}</span>
                  <span class="s-lbl">Departments</span>
                </div>
                <div class="c-stat-divider"></div>
                <div class="c-stat">
                  <span class="s-val">{{ comp.currency }}</span>
                  <span class="s-lbl">Currency</span>
                </div>
              </div>
            </div>

            <div class="company-card-footer">
              <div class="footer-left">
                @if (!comp.isDefault) {
                  <button 
                    type="button" 
                    class="btn btn-secondary btn-sm" 
                    (click)="makeDefault(comp)"
                    [disabled]="!isAdmin()">
                    Set as Default
                  </button>
                } @else {
                  <span class="active-badge"><app-icon name="check-circle" [size]="14"></app-icon> Active Default</span>
                }
              </div>

              <div class="card-actions">
                <button 
                  type="button" 
                  class="btn btn-secondary btn-sm" 
                  (click)="openManageDeptModal(comp)"
                  title="Manage Departments for this Company">
                  <app-icon name="briefcase" [size]="14"></app-icon>
                  <span>Dept Hub</span>
                </button>
                <button 
                  type="button" 
                  class="btn btn-secondary btn-icon btn-sm" 
                  (click)="openEditModal(comp)" 
                  title="Edit Company"
                  [disabled]="!isAdmin()">
                  <app-icon name="edit" [size]="16"></app-icon>
                </button>
                @if (!comp.isDefault) {
                  <button 
                    type="button" 
                    class="btn btn-danger btn-icon btn-sm" 
                    (click)="deleteCompany(comp)" 
                    title="Delete Entity"
                    [disabled]="!isAdmin()">
                    <app-icon name="trash" [size]="16"></app-icon>
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Add / Edit Company Modal -->
      <app-modal
        [isOpen]="isModalOpen()"
        [title]="isEditing() ? 'Edit Corporate Entity' : 'Add New Corporate Entity'"
        size="lg"
        (close)="isModalOpen.set(false)">
        
        <form [formGroup]="companyForm" (ngSubmit)="saveCompany()">
          <div class="grid-3">
            <div class="form-group">
              <label>Company Legal Name *</label>
              <input type="text" class="form-control" formControlName="companyName" placeholder="e.g. Pulse Cloud Labs Pvt Ltd" />
            </div>

            <div class="form-group">
              <label>Entity Code *</label>
              <input type="text" class="form-control font-mono" formControlName="code" placeholder="e.g. PULSE-001" />
            </div>

            <div class="form-group">
              <label>Entity Brand Tagline</label>
              <input type="text" class="form-control" formControlName="tagline" placeholder="e.g. Next-Gen Cloud Infrastructure" />
            </div>
          </div>

          <div class="grid-3">
            <div class="form-group">
              <label>Entity Type *</label>
              <select class="form-control" formControlName="type">
                <option value="Headquarters">Headquarters</option>
                <option value="Regional Branch">Regional Branch</option>
                <option value="Subsidiary">Subsidiary</option>
                <option value="Sister Entity">Sister Entity</option>
              </select>
            </div>

            <div class="form-group">
              <label>Industry</label>
              <input type="text" class="form-control" formControlName="industry" placeholder="Software SaaS" />
            </div>

            <div class="form-group">
              <label>Status</label>
              <select class="form-control" formControlName="status">
                <option value="Active">Active</option>
                <option value="Under Review">Under Review</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>CIN / Registration Number *</label>
              <input type="text" class="form-control font-mono" formControlName="registrationNumber" placeholder="U72200KA2022PTC000000" />
            </div>

            <div class="form-group">
              <label>GSTIN / Tax ID *</label>
              <input type="text" class="form-control font-mono" formControlName="taxId" placeholder="29ABCDE1234F1Z5" />
            </div>
          </div>

          <div class="grid-3">
            <div class="form-group">
              <label>Corporate Email *</label>
              <input type="email" class="form-control" formControlName="email" placeholder="contact@company.com" />
            </div>

            <div class="form-group">
              <label>Contact Phone</label>
              <input type="text" class="form-control" formControlName="phone" placeholder="+91 (80) 4000-0000" />
            </div>

            <div class="form-group">
              <label>Official Website</label>
              <input type="text" class="form-control" formControlName="website" placeholder="https://company.io" />
            </div>
          </div>

          <div class="form-group">
            <label>Registered Office Address *</label>
            <input type="text" class="form-control" formControlName="address" placeholder="Tower 1, Tech Park, Outer Ring Road" />
          </div>

          <div class="grid-4">
            <div class="form-group">
              <label>City *</label>
              <input type="text" class="form-control" formControlName="city" placeholder="Bengaluru" />
            </div>

            <div class="form-group">
              <label>State / Province</label>
              <input type="text" class="form-control" formControlName="state" placeholder="Karnataka" />
            </div>

            <div class="form-group">
              <label>Postal Code</label>
              <input type="text" class="form-control" formControlName="zipCode" placeholder="560100" />
            </div>

            <div class="form-group">
              <label>Country *</label>
              <input type="text" class="form-control" formControlName="country" placeholder="India" />
            </div>
          </div>

          <div class="grid-3">
            <div class="form-group">
              <label>Base Currency</label>
              <input type="text" class="form-control" formControlName="currency" placeholder="INR (₹)" />
            </div>

            <div class="form-group">
              <label>Primary Timezone</label>
              <input type="text" class="form-control" formControlName="timeZone" placeholder="Asia/Kolkata (IST +5:30)" />
            </div>

            <div class="form-group">
              <label>Brand Accent Color</label>
              <input type="color" class="form-control" formControlName="brandColor" style="height: 42px; padding: 2px;" />
            </div>
          </div>

          <div class="form-group">
            <label class="flex-align gap-2 cursor-pointer">
              <input type="checkbox" formControlName="isDefault" />
              <span>Set as Default Primary Organization for Payroll & Invoicing</span>
            </label>
          </div>

          @if (!isEditing()) {
            <div class="grid-2">
              <div class="form-group">
                <label>Admin Login Email *</label>
                <input type="email" class="form-control" formControlName="adminEmail" placeholder="admin@company.com" />
              </div>

              <div class="form-group">
                <label>Admin Login Password *</label>
                <input type="password" class="form-control" formControlName="adminPassword" placeholder="Minimum 8 characters" />
              </div>
            </div>
          }
        </form>

        <div modal-footer>
          <button type="button" class="btn btn-secondary" (click)="isModalOpen.set(false)">Cancel</button>
          <button type="button" class="btn btn-primary" (click)="saveCompany()" [disabled]="companyForm.invalid">
            {{ isEditing() ? 'Update Entity' : 'Register Company' }}
          </button>
        </div>
      </app-modal>

      <!-- 🏷️ Company Department Management Modal -->
      <app-modal
        [isOpen]="isDeptModalOpen()"
        [title]="'Department Hub — ' + (selectedCompanyForDepts()?.companyName || 'Company')"
        size="lg"
        (close)="isDeptModalOpen.set(false)">
        
        <div class="dept-modal-body">
          <div class="dept-modal-header-card">
            <div class="flex-align gap-2">
              <span class="badge badge-primary">{{ selectedCompanyForDepts()?.code }}</span>
              <h4>{{ selectedCompanyForDepts()?.companyName }}</h4>
            </div>
            <p class="font-xs text-muted">Each company manages its own independent departments. Employees added to this company will only see these departments.</p>
          </div>

          <!-- Existing Departments List for this Company -->
          <div class="existing-depts-section">
            <div class="flex-between mb-2">
              <span class="font-bold font-xs text-main">REGISTERED DEPARTMENTS ({{ selectedCompanyDepts().length }})</span>
            </div>

            <div class="depts-table-wrap">
              @for (dept of selectedCompanyDepts(); track dept.id) {
                <div class="dept-item-row">
                  <div class="dept-item-info">
                    <span class="dept-color-bar" [style.background]="dept.color"></span>
                    <div>
                      <div class="dept-name-text">{{ dept.name }} <span class="font-mono text-muted">({{ dept.code }})</span></div>
                      <div class="dept-head-text">Lead: {{ dept.headOfDepartment }}</div>
                    </div>
                  </div>

                  <div class="dept-item-actions">
                    <span class="badge badge-neutral">{{ dept.totalEmployees }} employees</span>
                    <button 
                      type="button" 
                      class="btn btn-danger btn-icon btn-sm" 
                      (click)="deleteDept(dept)" 
                      title="Delete Department">
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="empty-dept-note">
                  <app-icon name="briefcase" [size]="28"></app-icon>
                  <p>No custom departments registered for this company yet.</p>
                </div>
              }
            </div>
          </div>

          <!-- Add New Department Form for this Company -->
          <div class="add-dept-card">
            <h4 class="font-bold font-xs text-primary mb-3">➕ ADD NEW DEPARTMENT FOR THIS COMPANY</h4>
            <form [formGroup]="deptForm" (ngSubmit)="saveDepartmentForCompany()">
              <div class="grid-2">
                <div class="form-group">
                  <label>Department Name *</label>
                  <input type="text" class="form-control" formControlName="name" placeholder="e.g. Artificial Intelligence Labs" />
                </div>

                <div class="form-group">
                  <label>Department Code *</label>
                  <input type="text" class="form-control font-mono" formControlName="code" placeholder="e.g. AI-LAB" />
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label>Head of Department (Lead Manager) *</label>
                  <input type="text" class="form-control" formControlName="headOfDepartment" placeholder="e.g. Jitendra Shukla" />
                </div>

                <div class="form-group">
                  <label>Department Accent Color</label>
                  <input type="color" class="form-control" formControlName="color" style="height: 42px; padding: 2px;" />
                </div>
              </div>

              <button 
                type="submit" 
                class="btn btn-primary btn-block" 
                [disabled]="deptForm.invalid">
                <app-icon name="plus" [size]="16"></app-icon>
                <span>Add Department to {{ selectedCompanyForDepts()?.code }}</span>
              </button>
            </form>
          </div>
        </div>

        <div modal-footer>
          <button type="button" class="btn btn-secondary" (click)="isDeptModalOpen.set(false)">Close Hub</button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .company-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .access-denied-card {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(244, 63, 94, 0.08));
      border: 1px solid rgba(245, 158, 11, 0.3);
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem;

      h3 { font-size: 1rem; font-weight: 700; color: var(--warning-700); }
      p { font-size: 0.8125rem; color: var(--text-main); margin-top: 0.125rem; }
    }

    .filter-bar {
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
    }

    .company-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;

      @media (max-width: 1100px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: 700px) {
        grid-template-columns: 1fr;
      }
    }

    .company-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.25rem;
      position: relative;

      &.is-default {
        border-color: var(--primary-400);
        box-shadow: 0 0 0 1px var(--primary-400), var(--shadow-md);
      }

      .company-card-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .company-logo-box {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .company-tags {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.375rem;
        }
      }

      .company-card-body {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;

        .company-code {
          font-size: 0.6875rem;
          font-weight: 700;
          color: var(--text-subtle);
        }

        .company-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .company-tagline {
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.3;
          margin-bottom: 0.5rem;
        }

        .company-meta-list {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          padding: 0.625rem 0;
          border-top: 1px dashed var(--border-color);
          border-bottom: 1px dashed var(--border-color);

          .meta-item {
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

        .company-depts-preview {
          padding: 0.625rem;
          background: var(--bg-surface-subtle);
          border-radius: var(--radius-md);
          margin-top: 0.5rem;

          .depts-title {
            font-size: 0.6875rem;
            font-weight: 700;
            color: var(--text-subtle);
            letter-spacing: 0.05em;
          }

          .btn-text-action {
            font-size: 0.6875rem;
            font-weight: 700;
            color: var(--primary-600);
            background: transparent;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.25rem;

            &:hover {
              text-decoration: underline;
            }
          }

          .dept-tags-wrap {
            display: flex;
            flex-wrap: wrap;
            gap: 0.375rem;
            margin-top: 0.375rem;

            .dept-tag-badge {
              font-size: 0.6875rem;
              font-weight: 600;
              background: var(--bg-surface);
              padding: 0.25rem 0.5rem;
              border-radius: var(--radius-xs);
              border: 1px solid var(--border-color);
              border-left-width: 3px;
              color: var(--text-main);
            }

            .no-depts-text {
              font-size: 0.6875rem;
              color: var(--text-muted);
            }
          }
        }

        .company-stats-pill {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: var(--bg-surface-subtle);
          padding: 0.5rem;
          border-radius: var(--radius-md);
          margin-top: 0.5rem;

          .c-stat {
            display: flex;
            flex-direction: column;
            align-items: center;

            .s-val { font-size: 0.875rem; font-weight: 800; color: var(--text-main); }
            .s-lbl { font-size: 0.625rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
          }

          .c-stat-divider {
            width: 1px;
            height: 24px;
            background: var(--border-color);
          }
        }
      }

      .company-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-color);
        flex-wrap: wrap;
        gap: 0.5rem;

        .active-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--success-600);
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
      }
    }

    .dept-modal-body {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .dept-modal-header-card {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.05));
        border: 1px solid var(--primary-200);
        padding: 1rem;
        border-radius: var(--radius-md);

        h4 { font-size: 1rem; font-weight: 700; color: var(--text-main); }
      }

      .existing-depts-section {
        .depts-table-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .dept-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.625rem 0.875rem;
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);

          .dept-item-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;

            .dept-color-bar {
              width: 4px;
              height: 32px;
              border-radius: var(--radius-xs);
            }

            .dept-name-text {
              font-size: 0.8125rem;
              font-weight: 700;
              color: var(--text-main);
            }

            .dept-head-text {
              font-size: 0.6875rem;
              color: var(--text-muted);
            }
          }

          .dept-item-actions {
            display: flex;
            align-items: center;
            gap: 0.625rem;
          }
        }

        .empty-dept-note {
          text-align: center;
          padding: 1.5rem;
          color: var(--text-muted);
          font-size: 0.8125rem;
        }
      }

      .add-dept-card {
        background: var(--bg-surface-subtle);
        border: 1px solid var(--border-color);
        padding: 1.25rem;
        border-radius: var(--radius-md);

        .btn-block { width: 100%; margin-top: 0.5rem; }
      }
    }

    .cursor-pointer { cursor: pointer; }
    .font-mono { font-family: var(--font-mono); }
    .font-bold { font-weight: 700; }
    .font-xs { font-size: 0.75rem; }
    .text-main { color: var(--text-main); }
    .text-primary { color: var(--primary-600); }
    .text-muted { color: var(--text-muted); }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
  `]
})
export class CompanyListComponent {
  private readonly hrmsData = inject(HrmsDataService);
  readonly authService = inject(AuthService);
  private readonly deptApi = inject(DepartmentApiService);
  private readonly companyApi = inject(CompanyApiService);
  private readonly toast = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly companies = this.hrmsData.companies;
  readonly departments = this.hrmsData.departments;

  readonly isAdmin = computed(() => {
    const r = this.authService.currentUser()?.role;
    return r === 'Admin' || r === 'Super Admin';
  });

  readonly searchQuery = signal<string>('');
  readonly selectedType = signal<string>('ALL');

  readonly isModalOpen = signal<boolean>(false);
  readonly selectedCompanyToEdit = signal<CompanyProfile | null>(null);

  // Department Hub Modal signals
  readonly isDeptModalOpen = signal<boolean>(false);
  readonly selectedCompanyForDepts = signal<CompanyProfile | null>(null);

  readonly selectedCompanyDepts = computed<Department[]>(() => {
    const comp = this.selectedCompanyForDepts();
    if (!comp) return [];
    return this.departments().filter(d => d.companyId === comp.id);
  });

  readonly totalDepartmentsCount = computed(() => this.departments().length);

  companyForm!: FormGroup;
  deptForm!: FormGroup;

  readonly hqCount = computed(() => this.companies().filter(c => c.type === 'Headquarters').length);
  readonly branchCount = computed(() => this.companies().filter(c => c.type === 'Regional Branch').length);
  readonly subsidiaryCount = computed(() => this.companies().filter(c => c.type === 'Subsidiary').length);

  readonly filteredCompanies = computed(() => {
    let list = this.companies();
    const q = this.searchQuery().toLowerCase().trim();
    const type = this.selectedType();

    if (q) {
      list = list.filter(c =>
        c.companyName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.taxId.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }

    if (type !== 'ALL') {
      list = list.filter(c => c.type === type);
    }

    return list;
  });

  isEditing(): boolean {
    return !!this.selectedCompanyToEdit();
  }

  constructor() {
    this.initForms();
  }

  private initForms(): void {
    this.companyForm = this.fb.group({
      companyName: ['', Validators.required],
      code: ['', Validators.required],
      tagline: [''],
      type: ['Regional Branch', Validators.required],
      industry: ['Enterprise Software & Cloud SaaS'],
      status: ['Active', Validators.required],
      registrationNumber: ['', Validators.required],
      taxId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      website: ['https://'],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['India', Validators.required],
      currency: ['INR (₹)', Validators.required],
      timeZone: ['Asia/Kolkata (IST +5:30)', Validators.required],
      brandColor: ['#6366f1'],
      isDefault: [false],
      adminEmail: [''],
      adminPassword: ['']
    });

    this.deptForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      headOfDepartment: ['', Validators.required],
      color: ['#6366f1', Validators.required]
    });
  }

  getCompanyDepts(companyId: string): Department[] {
    return this.departments().filter(d => d.companyId === companyId);
  }

  getTypeBadgeClass(type: CompanyType): string {
    switch (type) {
      case 'Headquarters': return 'badge-primary';
      case 'Regional Branch': return 'badge-neutral';
      case 'Subsidiary': return 'badge-warning';
      default: return 'badge-neutral';
    }
  }

  openAddModal(): void {
    this.selectedCompanyToEdit.set(null);
    this.companyForm.reset({
      type: 'Regional Branch',
      industry: 'Enterprise Software & Cloud SaaS',
      status: 'Active',
      website: 'https://',
      country: 'India',
      currency: 'INR (₹)',
      timeZone: 'Asia/Kolkata (IST +5:30)',
      brandColor: '#6366f1',
      isDefault: false
    });
    this.isModalOpen.set(true);
  }

  openEditModal(comp: CompanyProfile): void {
    this.selectedCompanyToEdit.set(comp);
    this.companyForm.patchValue(comp);
    this.isModalOpen.set(true);
  }

  openManageDeptModal(comp: CompanyProfile): void {
    this.selectedCompanyForDepts.set(comp);
    this.deptForm.reset({
      name: '',
      code: '',
      headOfDepartment: '',
      color: comp.brandColor || '#6366f1'
    });
    this.isDeptModalOpen.set(true);
  }

  saveDepartmentForCompany(): void {
    if (this.deptForm.invalid) return;
    const formVal = this.deptForm.value;
    const comp = this.selectedCompanyForDepts();
    if (!comp) return;

    const newDept = this.hrmsData.addDepartment({
      companyId: comp.id,
      name: formVal.name,
      code: formVal.code.toUpperCase(),
      headOfDepartment: formVal.headOfDepartment,
      color: formVal.color
    });

    // Call Spring Boot backend API
    this.deptApi.createDepartment({
      companyId: comp.id,
      name: formVal.name,
      code: formVal.code.toUpperCase(),
      headOfDepartment: formVal.headOfDepartment,
      color: formVal.color
    }).subscribe({
      next: () => {
        this.toast.success('Department Added', `${newDept.name} (${newDept.code}) saved to database for ${comp.companyName}.`);
      },
      error: (err) => {
        console.warn('Backend API sync notice:', err?.message);
        this.toast.success('Department Added (Local)', `${newDept.name} (${newDept.code}) added to ${comp.companyName}.`);
      }
    });

    this.deptForm.reset({
      name: '',
      code: '',
      headOfDepartment: '',
      color: comp.brandColor || '#6366f1'
    });
  }

  deleteDept(dept: Department): void {
    const comp = this.selectedCompanyForDepts();
    if (confirm(`Remove department "${dept.name}" from ${comp?.companyName || 'company'}?`)) {
      this.hrmsData.deleteDepartment(dept.id);
      this.deptApi.deleteDepartment(dept.id).subscribe({
        next: () => this.toast.warning('Department Removed', `${dept.name} was deleted from database.`),
        error: () => this.toast.warning('Department Removed', `${dept.name} was deleted.`)
      });
    }
  }

  saveCompany(): void {
    if (this.companyForm.invalid) return;
    const formVal = this.companyForm.value;

    if (this.isEditing() && this.selectedCompanyToEdit()) {
      this.hrmsData.updateCompany(this.selectedCompanyToEdit()!.id, formVal);
      this.toast.success('Company Updated', `${formVal.companyName} profile updated.`);
    } else {
      if (!formVal.adminEmail || !formVal.adminPassword || formVal.adminPassword.length < 8) {
        this.toast.error('Admin Credentials Required', 'Enter a valid admin email and a password with at least 8 characters.');
        return;
      }
      this.companyApi.createCompany({
        ...formVal,
        adminName: `${formVal.companyName} Admin`,
        adminEmail: formVal.adminEmail,
        adminPassword: formVal.adminPassword
      }).subscribe({
        next: company => {
          this.companyApi.createCompanyAdmin({
            name: `${company.companyName} Admin`,
            email: formVal.adminEmail,
            password: formVal.adminPassword,
            role: 'Company Admin',
            companyId: company.id
          }).subscribe({
            next: () => {
              this.hrmsData.setCompanies([company, ...this.companies()]);
              this.toast.success('Company Registered', `${company.companyName} (${company.code}) and admin credentials created successfully.`);
              this.isModalOpen.set(false);
            },
            error: error => {
              console.error('Company admin credential creation failed:', error);
              this.toast.error('Credentials Not Created', `Company ${company.companyName} was saved, but admin credentials were not created.`);
            }
          });
        },
        error: error => {
          console.error('Company creation failed:', error);
          this.toast.error('Company Registration Failed', error?.error?.message || 'Company and admin credentials were not saved.');
        }
      });
      return;
    }

    this.isModalOpen.set(false);
  }

  makeDefault(comp: CompanyProfile): void {
    this.hrmsData.setDefaultCompany(comp.id);
    this.toast.info('Default Entity Changed', `${comp.companyName} is now the active primary organization.`);
  }

  deleteCompany(comp: CompanyProfile): void {
    if (confirm(`Are you sure you want to delete ${comp.companyName}?`)) {
      this.hrmsData.deleteCompany(comp.id);
      this.toast.warning('Company Removed', `${comp.companyName} was deleted.`);
    }
  }
}
