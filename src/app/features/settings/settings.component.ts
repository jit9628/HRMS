import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HrmsDataService } from '../../core/services/hrms-data.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Department } from '../../core/models/employee.model';
import { CompanyProfile } from '../../core/models/company.model';
import { DepartmentApiService } from '../../core/services/department-api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent, ModalComponent],
  template: `
    <div class="settings-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-titles">
          <div class="flex-align gap-2">
            <h1>Organization & Company Settings</h1>
            <span class="badge badge-primary">{{ selectedCompany()?.companyName || 'Enterprise' }}</span>
          </div>
          <p>Configure company profile, register custom departments, manage designations, and set preferences.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-primary" (click)="saveSettings()">
            <app-icon name="check" [size]="18"></app-icon>
            <span>Save Company Profile</span>
          </button>
        </div>
      </div>

      <!-- Company Switcher Bar for Super Admin -->
      @if (authService.currentUser()?.role === 'Super Admin') {
        <div class="card company-switch-bar">
          <div class="flex-align gap-2">
            <app-icon name="building" [size]="20"></app-icon>
            <span class="font-bold">Select Organization to Manage:</span>
          </div>
          <select class="form-control company-select" [ngModel]="selectedCompanyId()" (ngModelChange)="onCompanyChange($event)">
            @for (c of companies(); track c.id) {
              <option [value]="c.id">{{ c.companyName }} ({{ c.code }}) - {{ c.city }}</option>
            }
          </select>
        </div>
      }

      <!-- Settings Layout -->
      <div class="grid-settings">
        <!-- Company Profile Form -->
        <div class="card" *ngIf="selectedCompany()">
          <div class="flex-between mb-2">
            <h3 class="section-title">Company Profile ({{ selectedCompany()?.code }})</h3>
            <span class="badge badge-neutral">{{ selectedCompany()?.type }}</span>
          </div>
          <p class="text-muted font-xs mb-4">Official legal details for tax filings, corporate letterheads, and payslips.</p>

          <div class="grid-2">
            <div class="form-group">
              <label>Company Legal Name *</label>
              <input type="text" class="form-control" [(ngModel)]="companyFormModel.companyName" />
            </div>
            <div class="form-group">
              <label>Tagline / Motto</label>
              <input type="text" class="form-control" [(ngModel)]="companyFormModel.tagline" />
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Industry</label>
              <input type="text" class="form-control" [(ngModel)]="companyFormModel.industry" />
            </div>
            <div class="form-group">
              <label>Official Website</label>
              <input type="text" class="form-control" [(ngModel)]="companyFormModel.website" />
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>GSTIN / Tax Identification Number</label>
              <input type="text" class="form-control font-mono" [(ngModel)]="companyFormModel.taxId" />
            </div>
            <div class="form-group">
              <label>CIN / Registration Number</label>
              <input type="text" class="form-control font-mono" [(ngModel)]="companyFormModel.registrationNumber" />
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Official Email</label>
              <input type="email" class="form-control" [(ngModel)]="companyFormModel.email" />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="text" class="form-control" [(ngModel)]="companyFormModel.phone" />
            </div>
          </div>

          <div class="form-group">
            <label>Registered Office Address</label>
            <input type="text" class="form-control" [(ngModel)]="companyFormModel.address" />
          </div>

          <div class="grid-3">
            <div class="form-group">
              <label>City</label>
              <input type="text" class="form-control" [(ngModel)]="companyFormModel.city" />
            </div>
            <div class="form-group">
              <label>State / Region</label>
              <input type="text" class="form-control" [(ngModel)]="companyFormModel.state" />
            </div>
            <div class="form-group">
              <label>Postal / Zip Code</label>
              <input type="text" class="form-control" [(ngModel)]="companyFormModel.zipCode" />
            </div>
          </div>
        </div>

        <!-- Right Side: Departments & System Preferences -->
        <div class="settings-sidebar">
          <!-- Department Roster with Add Department Feature -->
          <div class="card">
            <div class="flex-between mb-3">
              <div>
                <h3 class="section-title">Departments ({{ companyDepartments().length }})</h3>
                <span class="text-muted font-xs">For {{ selectedCompany()?.companyName }}</span>
              </div>
              <button 
                type="button" 
                class="btn btn-secondary btn-sm" 
                (click)="openAddDeptModal()"
                [disabled]="!isCompanyAdmin()"
                [title]="isCompanyAdmin() ? 'Add new department' : 'Only Company Admin can add departments'">
                <app-icon name="plus" [size]="14"></app-icon>
                <span>Add Dept</span>
              </button>
            </div>

            <div class="dept-pills-list">
              @for (dept of companyDepartments(); track dept.id) {
                <div class="dept-card-mini">
                  <div class="flex-align gap-2">
                    <span class="dept-dot" [style.background]="dept.color"></span>
                    <div>
                      <div class="font-bold font-xs">{{ dept.name }} ({{ dept.code }})</div>
                      <div class="text-muted font-xs">Head: {{ dept.headOfDepartment }}</div>
                    </div>
                  </div>
                  <div class="flex-align gap-2">
                    <span class="badge badge-neutral">{{ dept.totalEmployees }} staff</span>
                    <button 
                      type="button" 
                      class="btn btn-danger btn-icon btn-sm" 
                      (click)="deleteDept(dept)" 
                      [disabled]="!isCompanyAdmin()"
                      title="Delete Department">
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="empty-dept-box">
                  <p class="font-xs text-muted">No custom departments added yet for this company.</p>
                  <button 
                    type="button" 
                    class="btn btn-primary btn-sm mt-2" 
                    (click)="openAddDeptModal()"
                    [disabled]="!isCompanyAdmin()">
                    <app-icon name="plus" [size]="14"></app-icon>
                    <span>Create First Department</span>
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Preferences -->
          <div class="card">
            <h3 class="section-title">System & Display Preferences</h3>
            <div class="preference-item">
              <div>
                <div class="font-bold font-xs">Theme Mode</div>
                <div class="text-muted font-xs">Toggle between Light and Dark interface</div>
              </div>
              <button 
                type="button" 
                class="btn btn-secondary btn-sm" 
                (click)="themeService.toggleTheme()">
                <app-icon [name]="themeService.currentTheme() === 'light' ? 'moon' : 'sun'" [size]="16"></app-icon>
                <span>{{ themeService.currentTheme() === 'light' ? 'Switch to Dark' : 'Switch to Light' }}</span>
              </button>
            </div>

            <div class="preference-item">
              <div>
                <div class="font-bold font-xs">Base Currency</div>
                <div class="text-muted font-xs">{{ selectedCompany()?.currency || 'INR (₹)' }}</div>
              </div>
              <span class="badge badge-primary">Active</span>
            </div>

            <div class="preference-item">
              <div>
                <div class="font-bold font-xs">Primary Timezone</div>
                <div class="text-muted font-xs">{{ selectedCompany()?.timeZone || 'Asia/Kolkata (IST +5:30)' }}</div>
              </div>
              <span class="badge badge-neutral">Standard</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Department Modal -->
      <app-modal
        [isOpen]="isDeptModalOpen()"
        title="Add Company Department"
        size="md"
        (close)="isDeptModalOpen.set(false)">
        
        <form [formGroup]="deptForm" (ngSubmit)="saveDepartment()">
          <div class="form-group">
            <label>Target Company</label>
            <input type="text" class="form-control" [value]="selectedCompany()?.companyName" disabled />
          </div>

          <div class="form-group">
            <label>Department Name *</label>
            <input type="text" class="form-control" formControlName="name" placeholder="e.g. Artificial Intelligence & Labs" />
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Department Code *</label>
              <input type="text" class="form-control font-mono" formControlName="code" placeholder="e.g. AI-LAB" />
            </div>

            <div class="form-group">
              <label>Department Accent Color</label>
              <input type="color" class="form-control" formControlName="color" style="height: 42px; padding: 2px;" />
            </div>
          </div>

          <div class="form-group">
            <label>Head of Department (Lead Manager) *</label>
            <input type="text" class="form-control" formControlName="headOfDepartment" placeholder="e.g. Dr. Jitendra Shukla" />
          </div>
        </form>

        <div modal-footer>
          <button type="button" class="btn btn-secondary" (click)="isDeptModalOpen.set(false)">Cancel</button>
          <button type="button" class="btn btn-primary" (click)="saveDepartment()" [disabled]="deptForm.invalid">
            Create Department
          </button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .settings-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .company-switch-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.875rem 1.25rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.05));
      border: 1px solid var(--primary-300);

      .company-select {
        max-width: 380px;
        font-weight: 600;
      }
    }

    .grid-settings {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 1.5rem;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .settings-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .section-title {
      font-size: 1.0625rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .dept-pills-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 320px;
      overflow-y: auto;
    }

    .dept-card-mini {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      background: var(--bg-surface-subtle);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);

      .dept-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
    }

    .empty-dept-box {
      text-align: center;
      padding: 1.5rem 1rem;
      background: var(--bg-surface-subtle);
      border-radius: var(--radius-md);
      border: 1px dashed var(--border-color);
    }

    .preference-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }
    }

    .font-bold { font-weight: 700; }
    .font-xs { font-size: 0.75rem; }
    .font-mono { font-family: var(--font-mono); }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-2 { margin-top: 0.5rem; }
  `]
})
export class SettingsComponent {
  private readonly hrmsData = inject(HrmsDataService);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly deptApi = inject(DepartmentApiService);
  private readonly toast = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly companies = this.hrmsData.companies;
  readonly selectedCompanyId = signal<string>(
    this.authService.currentUser()?.companyId || this.hrmsData.companies()[0]?.id || 'CMP-101'
  );

  readonly isCompanyAdmin = computed(() => {
    const r = this.authService.currentUser()?.role;
    return r === 'Company Admin' || r === 'Super Admin' || r === 'Admin';
  });

  readonly selectedCompany = computed<CompanyProfile | undefined>(() => {
    return this.companies().find(c => c.id === this.selectedCompanyId());
  });

  readonly companyDepartments = computed<Department[]>(() => {
    const compId = this.selectedCompanyId();
    return this.hrmsData.departments().filter(d => d.companyId === compId);
  });

  companyFormModel: Partial<CompanyProfile> = {};

  readonly isDeptModalOpen = signal<boolean>(false);
  deptForm!: FormGroup;

  constructor() {
    this.syncCompanyModel();
    this.initDeptForm();
  }

  private syncCompanyModel(): void {
    const comp = this.selectedCompany();
    if (comp) {
      this.companyFormModel = { ...comp };
    }
  }

  private initDeptForm(): void {
    this.deptForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      headOfDepartment: ['', Validators.required],
      color: ['#6366f1', Validators.required]
    });
  }

  onCompanyChange(newId: string): void {
    this.selectedCompanyId.set(newId);
    this.syncCompanyModel();
  }

  openAddDeptModal(): void {
    if (!this.isCompanyAdmin()) {
      this.toast.error('Permission Denied', 'Only Company Admin can add departments.');
      return;
    }
    this.deptForm.reset({
      name: '',
      code: '',
      headOfDepartment: '',
      color: '#6366f1'
    });
    this.isDeptModalOpen.set(true);
  }

  saveDepartment(): void {
    if (this.deptForm.invalid || !this.isCompanyAdmin()) return;
    const formVal = this.deptForm.value;
    const comp = this.selectedCompany();
    if (!comp) return;

    const newDept = this.hrmsData.addDepartment({
      companyId: comp.id,
      name: formVal.name,
      code: formVal.code.toUpperCase(),
      headOfDepartment: formVal.headOfDepartment,
      color: formVal.color
    });

    // Call Spring Boot backend API: POST http://localhost:8080/api/v1/departments
    this.deptApi.createDepartment({
      companyId: comp.id,
      name: formVal.name,
      code: formVal.code.toUpperCase(),
      headOfDepartment: formVal.headOfDepartment,
      color: formVal.color
    }).subscribe({
      next: () => {
        this.toast.success('Department Created', `${newDept.name} (${newDept.code}) saved to backend for ${comp.companyName}.`);
      },
      error: (err) => {
        console.warn('Department API sync note:', err?.message);
        this.toast.success('Department Created (Local)', `${newDept.name} added for ${comp.companyName}.`);
      }
    });

    this.isDeptModalOpen.set(false);
  }

  deleteDept(dept: Department): void {
    if (!this.isCompanyAdmin()) {
      this.toast.error('Permission Denied', 'Only Company Admin can delete departments.');
      return;
    }

    if (confirm(`Delete department "${dept.name}" from ${this.selectedCompany()?.companyName || 'company'}?`)) {
      this.hrmsData.deleteDepartment(dept.id);
      this.deptApi.deleteDepartment(dept.id).subscribe({
        next: () => this.toast.warning('Department Removed', `${dept.name} deleted from backend.`),
        error: () => this.toast.warning('Department Removed', `${dept.name} deleted.`)
      });
    }
  }

  saveSettings(): void {
    const comp = this.selectedCompany();
    if (!comp) return;

    this.hrmsData.updateCompany(comp.id, this.companyFormModel);
    this.toast.success('Company Profile Saved', `${this.companyFormModel.companyName} profile updated.`);
  }
}
