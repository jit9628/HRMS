import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MenuApiService } from '../../core/services/menu-api.service';
import { AccessControlApiService, Definition } from '../../core/services/access-control-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AuthUser } from '../../core/models/auth.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-access-control',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="access-page">
      <div class="page-header">
        <div class="header-titles"><h1>Access Control</h1><p>Assign roles, permissions, menus and submenus to users.</p></div>
      </div>
      <div class="access-layout">
        <section class="card users-panel">
          <h3>Users</h3>
          @for (user of users(); track user.id) {
            <button type="button" class="user-row" [class.active]="selectedUser()?.id === user.id" (click)="selectUser(user)">
              <span class="avatar avatar-sm">{{ user.avatarInitials }}</span><span><strong>{{ user.name }}</strong><small>{{ user.email }} · {{ user.companyName || 'Enterprise' }}</small></span>
            </button>
          }
        </section>
        @if (selectedUser(); as user) {
          <section class="card access-panel">
            <div class="flex-between"><div><h2>{{ user.name }}</h2><p>{{ user.email }}</p></div><span class="badge badge-primary">{{ user.role }}</span></div>
            <div class="catalog-creator"><input [(ngModel)]="newRoleCode" placeholder="Role code"><input [(ngModel)]="newRoleName" placeholder="Role name"><button class="btn btn-secondary btn-sm" type="button" (click)="createRole()">Create Role</button><input [(ngModel)]="newPermissionCode" placeholder="Permission code"><input [(ngModel)]="newPermissionName" placeholder="Permission name"><button class="btn btn-secondary btn-sm" type="button" (click)="createPermission()">Create Permission</button></div>
            <div class="access-section"><h3>Assign Roles</h3><div class="check-grid">@for (role of roles(); track role.code) {<label><input type="checkbox" [checked]="selectedRoles().has(role.name)" (change)="toggleRole(role.name)"> {{ role.name }}</label>}</div><button class="btn btn-primary btn-sm" type="button" (click)="saveRoles()">Save Roles</button></div>
            <div class="access-section"><h3>Assign Menus & Submenus</h3><div class="menu-tree">@for (menu of menus; track menu.code) {<div class="menu-item"><label><input type="checkbox" [checked]="selectedMenus().has(menu.code)" (change)="toggleMenu(menu.code)"> <app-icon [name]="menu.icon" [size]="16"></app-icon> {{ menu.title }}</label>@for (submenu of menu.submenus; track submenu.code) {<label class="submenu"><input type="checkbox" [checked]="selectedMenus().has(submenu.code)" (change)="toggleMenu(submenu.code)"> {{ submenu.title }}</label>}</div>}</div><button class="btn btn-primary btn-sm" type="button" (click)="saveMenus()">Save Menus</button></div>
            <div class="access-section"><h3>Assign Permissions</h3><div class="permission-grid">@for (permission of permissions(); track permission.code) {<label><input type="checkbox" [checked]="selectedPermissions().has(permission.code)" (change)="togglePermission(permission.code)"> {{ permission.name }}</label>}</div><button class="btn btn-primary btn-sm" type="button" (click)="savePermissions()">Save Permissions</button></div>
          </section>
        } @else {<section class="card empty-panel"><app-icon name="users" [size]="32"></app-icon><h3>Select a user</h3><p>Choose a user to manage access.</p></section>}
      </div>
    </div>
  `,
  styles: [`
    .access-layout { display:grid; grid-template-columns:280px 1fr; gap:1rem; }
    .users-panel, .access-panel { padding:1.25rem; }
    .user-row { display:flex; width:100%; gap:.65rem; padding:.7rem; border:0; background:transparent; color:inherit; text-align:left; border-radius:var(--radius-md); cursor:pointer; }
    .user-row.active, .user-row:hover { background:var(--bg-surface-subtle); }
    .user-row span:nth-child(2) { display:flex; flex-direction:column; min-width:0; } .user-row small { color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .access-section { border-top:1px solid var(--border-color); padding-top:1rem; margin-top:1rem; } .check-grid, .permission-grid { display:flex; flex-wrap:wrap; gap:.65rem 1rem; margin: .75rem 0 1rem; } label { cursor:pointer; } .menu-item { padding:.45rem 0; } .submenu { display:inline-flex; margin: .35rem 0 0 1.5rem; color:var(--text-muted); } .empty-panel { min-height:300px; display:grid; place-content:center; text-align:center; color:var(--text-muted); }
    @media (max-width: 800px) { .access-layout { grid-template-columns:1fr; } }
  `]
})
export class AccessControlComponent {
  readonly authService = inject(AuthService);
  private readonly menuApi = inject(MenuApiService);
  private readonly accessApi = inject(AccessControlApiService);
  private readonly toast = inject(NotificationService);
  readonly users = signal<AuthUser[]>([]);
  readonly selectedUser = signal<AuthUser | null>(null);
  readonly selectedRoles = signal(new Set<string>());
  readonly selectedMenus = signal(new Set<string>());
  readonly selectedPermissions = signal(new Set<string>());
  readonly roles = signal<Definition[]>([]);
  readonly permissions = signal<Definition[]>([]);
  newRoleCode = ''; newRoleName = ''; newPermissionCode = ''; newPermissionName = '';
  readonly menus = [
    { code:'DASHBOARD', title:'Dashboard', icon:'dashboard', submenus:[] }, { code:'EMPLOYEES', title:'Employees', icon:'users', submenus:[{code:'EMPLOYEES.DIRECTORY', title:'Directory'},{code:'EMPLOYEES.PROFILES', title:'Profiles'}] },
    { code:'ATTENDANCE', title:'Attendance', icon:'clock', submenus:[{code:'ATTENDANCE.PUNCH', title:'Punch In/Out'},{code:'ATTENDANCE.REPORTS', title:'Reports'}] }, { code:'LEAVES', title:'Leave Management', icon:'calendar', submenus:[{code:'LEAVES.APPLY', title:'Apply Leave'},{code:'LEAVES.APPROVALS', title:'Approvals'}] },
    { code:'PAYROLL', title:'Payroll & Payslips', icon:'dollar-sign', submenus:[{code:'PAYROLL.GENERATE', title:'Generate Payroll'},{code:'PAYROLL.PAYSLIPS', title:'Payslips'}] }, { code:'RECRUITMENT', title:'Recruitment', icon:'briefcase', submenus:[{code:'RECRUITMENT.JOBS', title:'Job Openings'},{code:'RECRUITMENT.CANDIDATES', title:'Candidates'}] }, { code:'PERFORMANCE', title:'Performance', icon:'award', submenus:[] }, { code:'SETTINGS', title:'Settings', icon:'settings', submenus:[] }
  ];
  constructor() {
    this.accessApi.getUsers().subscribe({ next: users => this.users.set(users), error: () => this.toast.error('Access Control', 'Users could not be loaded.') });
    this.accessApi.getRoles().subscribe({ next: roles => this.roles.set(roles), error: () => this.toast.error('Access Control', 'Roles could not be loaded.') });
    this.accessApi.getPermissionDefinitions().subscribe({ next: permissions => this.permissions.set(permissions), error: () => this.toast.error('Access Control', 'Permissions could not be loaded.') });
  }
  selectUser(user: AuthUser): void { this.selectedUser.set(user); this.selectedRoles.set(new Set(user.roles || [user.role])); this.menuApi.getUserAssignments(user.id).subscribe(menus => this.selectedMenus.set(new Set(menus))); this.accessApi.getPermissions(user.id).subscribe(items => this.selectedPermissions.set(new Set(items.map(item => item.permissionCode)))); }
  toggleRole(role: string): void { this.toggle(this.selectedRoles, role); }
  toggleMenu(code: string): void { this.toggle(this.selectedMenus, code); }
  togglePermission(code: string): void { this.toggle(this.selectedPermissions, code); }
  createRole(): void { if (!this.newRoleCode.trim() || !this.newRoleName.trim()) return; this.accessApi.createRole(this.newRoleCode, this.newRoleName, '').subscribe(role => { this.roles.update(items => [...items, role]); this.newRoleCode = ''; this.newRoleName = ''; this.toast.success('Access Control', 'Role created successfully.'); }); }
  createPermission(): void { if (!this.newPermissionCode.trim() || !this.newPermissionName.trim()) return; this.accessApi.createPermission(this.newPermissionCode, this.newPermissionName, '').subscribe(permission => { this.permissions.update(items => [...items, permission]); this.newPermissionCode = ''; this.newPermissionName = ''; this.toast.success('Access Control', 'Permission created successfully.'); }); }
  private toggle(target: ReturnType<typeof signal<Set<string>>>, value: string): void { const next = new Set(target()); next.has(value) ? next.delete(value) : next.add(value); target.set(next); }
  saveRoles(): void {
    const user = this.selectedUser();
    if (!user) return;
    this.authService.assignRoles(user.id, [...this.selectedRoles()]).subscribe(() => this.toast.success('Access Control', 'Roles assigned successfully.'));
  }
  saveMenus(): void {
    const user = this.selectedUser();
    if (!user) return;
    this.menuApi.getUserAssignments(user.id).subscribe(current => {
      const wanted = this.selectedMenus();
      const add = [...wanted].filter(code => !current.includes(code));
      const remove = current.filter(code => !wanted.has(code));
      const requests = [...add.map(code => this.menuApi.assignMenu(user.id, code)), ...remove.map(code => this.menuApi.removeMenu(user.id, code))];
      if (requests.length === 0) { this.toast.success('Access Control', 'Menus are already up to date.'); return; }
      forkJoin(requests).subscribe(() => this.toast.success('Access Control', 'Menus and submenus assigned successfully.'));
    });
  }
  savePermissions(): void {
    const user = this.selectedUser();
    if (!user) return;
    this.accessApi.clearPermissions(user.id).subscribe(() => {
      const requests = [...this.selectedPermissions()].map(code => this.accessApi.assignPermission(user.id, 'ALL', code));
      if (requests.length === 0) {
        this.toast.success('Access Control', 'Permissions cleared successfully.');
        return;
      }
      forkJoin(requests).subscribe(() => this.toast.success('Access Control', 'Permissions assigned successfully.'));
    });
  }
}