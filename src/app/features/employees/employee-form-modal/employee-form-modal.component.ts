import { Component, input, output, inject, OnInit, OnChanges, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Employee, Department } from '../../../core/models/employee.model';
import { HrmsDataService } from '../../../core/services/hrms-data.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmployeeApiService } from '../../../core/services/employee-api.service';
import { MenuApiService } from '../../../core/services/menu-api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-employee-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal 
      [isOpen]="isOpen()" 
      [title]="isEditing() ? 'Edit Employee Profile' : 'Onboard New Employee to Company'" 
      size="lg"
      (close)="close.emit()">
      
      <form [formGroup]="empForm" (ngSubmit)="onSubmit()">
        <!-- Company Assignment -->
        <div class="form-group company-select-group">
          <label>Target Organization / Company *</label>
          <select 
            class="form-control company-highlight" 
            formControlName="companyId"
            (change)="onCompanyChange()">
            @for (c of visibleCompanies(); track c.id) {
              <option [value]="c.id">{{ c.companyName }} ({{ c.code }}) - {{ c.city }}</option>
            }
          </select>
        </div>

        <div class="grid-2">
          <!-- First Name -->
          <div class="form-group">
            <label>First Name *</label>
            <input type="text" class="form-control" formControlName="firstName" placeholder="e.g. Aarav" />
          </div>

          <!-- Last Name -->
          <div class="form-group">
            <label>Last Name *</label>
            <input type="text" class="form-control" formControlName="lastName" placeholder="e.g. Sharma" />
          </div>
        </div>

        <div class="grid-2">
          <!-- Email -->
          <div class="form-group">
            <label>Corporate Work Email *</label>
            <input type="email" class="form-control" formControlName="email" placeholder="name@company.com" />
          </div>

          <!-- Phone -->
          <div class="form-group">
            <label>Phone Number *</label>
            <input type="text" class="form-control" formControlName="phone" placeholder="+91 98765 43210" />
          </div>
        </div>

        <div class="grid-2">
          <!-- Department (Filtered by Company) -->
          <div class="form-group">
            <label>Department (for selected company) *</label>
            <select class="form-control" formControlName="department">
              <option value="">-- Select Company Department --</option>
              @for (dept of availableDepartments(); track dept.id) {
                <option [value]="dept.name">{{ dept.name }} ({{ dept.code }})</option>
              }
            </select>
            @if (availableDepartments().length === 0) {
              <span class="font-xs text-warning">⚠️ No departments found for this company. Please add departments in Settings.</span>
            }
          </div>

          <!-- Designation -->
          <div class="form-group">
            <label>Designation / Job Role *</label>
            <input type="text" class="form-control" formControlName="designation" placeholder="e.g. Senior Software Engineer" />
          </div>
        </div>

        <div class="grid-3">
          <!-- Employment Type -->
          <div class="form-group">
            <label>Employment Type</label>
            <select class="form-control" formControlName="employmentType">
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
            </select>
          </div>

          <!-- Status -->
          <div class="form-group">
            <label>Status</label>
            <select class="form-control" formControlName="status">
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Probation">Probation</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          <!-- Monthly Salary -->
          <div class="form-group">
            <label>Monthly Salary (CTC) *</label>
            <input type="number" class="form-control" formControlName="salary" placeholder="e.g. 120000" />
          </div>
        </div>

        <div class="grid-2">
          <!-- Join Date -->
          <div class="form-group">
            <label>Date of Joining *</label>
            <input type="date" class="form-control" formControlName="joinDate" />
          </div>

          <!-- Location -->
          <div class="form-group">
            <label>Office Work Location</label>
            <input type="text" class="form-control" formControlName="location" placeholder="e.g. Bengaluru, India" />
          </div>

          @if (!isEditing()) {
            <div class="registration-admin-box">
              <h3>Employee Login & Access</h3>
              <div class="grid-3">
                <div class="form-group">
                  <label>Login Password *</label>
                  <input type="password" class="form-control" formControlName="loginPassword" placeholder="Minimum 6 characters" />
                </div>
                <div class="form-group">
                  <label>Role *</label>
                  <select class="form-control" formControlName="assignedRole">
                    <option value="Employee">Employee</option>
                    <option value="HR Manager">HR Manager</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Assigned Menus</label>
                  <div class="menu-checks">
                    @for (menu of assignableMenus; track menu.code) {
                      <label><input type="checkbox" [checked]="selectedMenus.has(menu.code)" (change)="toggleMenu(menu.code)" /> {{ menu.title }}</label>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </form>

      <div modal-footer>
        <button type="button" class="btn btn-secondary" (click)="close.emit()">Cancel</button>
        <button type="button" class="btn btn-primary" [disabled]="empForm.invalid" (click)="onSubmit()">
          {{ isEditing() ? 'Update Changes' : 'Onboard Employee' }}
        </button>
      </div>
    </app-modal>
  `,
  styles: [`
    .company-select-group {
      background: var(--bg-surface-subtle);
      padding: 0.75rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--primary-200);
      margin-bottom: 1rem;
    }
    .company-highlight {
      font-weight: 700;
      color: var(--primary-700);
    }
    .text-warning { color: var(--warning-600); }
    .font-xs { font-size: 0.75rem; }
    .registration-admin-box { margin-top: 1rem; padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); }
    .registration-admin-box h3 { margin-bottom: 0.75rem; }
    .menu-checks { display: flex; flex-wrap: wrap; gap: 0.35rem 0.75rem; max-height: 100px; overflow-y: auto; }
    .menu-checks label { font-size: 0.75rem; white-space: nowrap; }
  `]
})
export class EmployeeFormModalComponent implements OnInit, OnChanges {
  isOpen = input<boolean>(false);
  employeeToEdit = input<Employee | null>(null);
  
  close = output<void>();
  saved = output<Employee>();

  private readonly fb = inject(FormBuilder);
  private readonly hrmsData = inject(HrmsDataService);
  readonly authService = inject(AuthService);
  private readonly toast = inject(NotificationService);
  private readonly employeeApi = inject(EmployeeApiService);
  private readonly menuApi = inject(MenuApiService);

  readonly companies = this.hrmsData.companies;
  readonly visibleCompanies = computed(() => {
    const user = this.authService.currentUser();
    if (user?.role === 'Company Admin') {
      return this.companies().filter(company => company.id === user.companyId);
    }
    return this.companies();
  });
  readonly departments = this.hrmsData.departments;
  readonly selectedCompanyId = signal<string>('CMP-101');

  readonly availableDepartments = computed<Department[]>(() => {
    const compId = this.selectedCompanyId();
    return this.departments().filter(d => d.companyId === compId);
  });

  empForm!: FormGroup;
  readonly assignableMenus = [
    { code: 'DASHBOARD', title: 'Dashboard' }, { code: 'ATTENDANCE', title: 'Attendance' },
    { code: 'LEAVES', title: 'Leaves' }, { code: 'PAYROLL', title: 'Payroll' },
    { code: 'PERFORMANCE', title: 'Performance' }, { code: 'EMPLOYEES', title: 'Employees' }
  ];
  readonly selectedMenus = new Set<string>(['DASHBOARD', 'ATTENDANCE', 'LEAVES', 'PAYROLL', 'PERFORMANCE']);

  isEditing(): boolean {
    return !!this.employeeToEdit();
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employeeToEdit'] && this.empForm) {
      const edit = this.employeeToEdit();
      if (edit) {
        this.selectedCompanyId.set(edit.companyId);
        this.empForm.patchValue(edit);
      } else {
        const defaultCompId = this.authService.currentUser()?.companyId || this.companies()[0]?.id || 'CMP-101';
        this.selectedCompanyId.set(defaultCompId);
        this.empForm.reset({
          companyId: defaultCompId,
          employmentType: 'Full-Time',
          status: 'Active',
          salary: 100000,
          joinDate: new Date().toISOString().split('T')[0],
          location: 'Bengaluru, India'
        });
      }
    }
  }

  private initForm(): void {
    const emp = this.employeeToEdit();
    const defaultCompId = emp?.companyId || this.authService.currentUser()?.companyId || this.companies()[0]?.id || 'CMP-101';
    this.selectedCompanyId.set(defaultCompId);

    this.empForm = this.fb.group({
      companyId: [defaultCompId, Validators.required],
      firstName: [emp?.firstName || '', Validators.required],
      lastName: [emp?.lastName || '', Validators.required],
      email: [emp?.email || '', [Validators.required, Validators.email]],
      phone: [emp?.phone || '', Validators.required],
      department: [emp?.department || '', Validators.required],
      designation: [emp?.designation || '', Validators.required],
      employmentType: [emp?.employmentType || 'Full-Time', Validators.required],
      status: [emp?.status || 'Active', Validators.required],
      salary: [emp?.salary || 100000, [Validators.required, Validators.min(1000)]],
      joinDate: [emp?.joinDate || new Date().toISOString().split('T')[0], Validators.required],
      location: [emp?.location || 'Bengaluru, India', Validators.required]
      ,loginPassword: ['', [Validators.required, Validators.minLength(6)]]
      ,assignedRole: ['Employee', Validators.required]
    });
  }

  onCompanyChange(): void {
    const newCompId = this.empForm.get('companyId')?.value;
    if (newCompId) {
      this.selectedCompanyId.set(newCompId);
      // Reset department when company changes
      this.empForm.get('department')?.setValue('');
    }
  }

  onSubmit(): void {
    if (this.empForm.invalid) return;
    const formVal = this.empForm.value;
    const comp = this.companies().find(c => c.id === formVal.companyId) || this.companies()[0];

    const payload = {
      ...formVal,
      companyId: comp.id,
      companyName: comp.companyName
    };

    if (this.isEditing() && this.employeeToEdit()) {
      this.hrmsData.updateEmployee(this.employeeToEdit()!.id, payload);
      this.toast.success('Profile Updated', `${payload.firstName} ${payload.lastName}'s records have been updated.`);
      this.saved.emit({ ...this.employeeToEdit()!, ...payload });
    } else {
      const employeeCode = 'EMP' + (this.hrmsData.employees().length + 1).toString().padStart(3, '0');
      const created = this.hrmsData.addEmployee({
        ...payload,
        employeeCode
      });
      this.employeeApi.createEmployee({ ...payload, employeeCode }).subscribe({
        next: employee => {
          this.authService.registerCredentials({
            name: `${employee.firstName} ${employee.lastName}`,
            email: employee.email,
            password: formVal.loginPassword,
            companyId: employee.companyId,
            companyName: employee.companyName
          }).subscribe({
            next: credentials => {
              this.authService.assignRoles(credentials.data.id, [formVal.assignedRole]).subscribe({
                next: () => forkJoin([...this.selectedMenus].map(code => this.menuApi.assignMenu(credentials.data.id, code))).subscribe({
                  next: () => {
                    this.toast.success('Employee Onboarded', `${employee.firstName} ${employee.lastName} created with role and menus.`);
                    this.saved.emit({ ...created, ...employee });
                    this.close.emit();
                  },
                  error: () => this.toast.error('Menu Assignment Failed', 'Employee and role were created, but menus could not be assigned.')
                }),
                error: error => this.toast.error('Role Assignment Failed', error?.error?.message || 'Employee credentials were created but role assignment failed.')
              });
            },
            error: error => this.toast.error('Credentials Failed', error?.error?.message || 'Employee was created but login credentials failed.')
          });
        },
        error: error => this.toast.error('Employee Creation Failed', error?.error?.message || 'Employee could not be created.')
      });
      return;
    }
    this.close.emit();
  }

  toggleMenu(code: string): void {
    if (this.selectedMenus.has(code)) this.selectedMenus.delete(code);
    else this.selectedMenus.add(code);
  }
}
