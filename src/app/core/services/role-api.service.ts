import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, of, tap, throwError } from 'rxjs';
import { RoleDto, CreateRoleRequest, RoleApiResponse } from '../models/role.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class RoleApiService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(NotificationService);
  private readonly API_URL = 'http://localhost:8080/api/v1/role';
  private readonly STORAGE_KEY = 'pulse_hrms_custom_roles';

  readonly roles = signal<RoleDto[]>(this.getInitialRoles());
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);

  /**
   * Fetch all roles from GET http://localhost:8080/api/v1/role
   */
  getRoles(): Observable<RoleDto[]> {
    this.isLoading.set(true);
    return this.http.get<unknown>(this.API_URL).pipe(
      map(response => this.extractRoles(response)),
      map(fetchedRoles => {
        if (fetchedRoles && fetchedRoles.length > 0) {
          // Merge with any local custom created roles
          const local = this.loadLocalRoles();
          for (const l of local) {
            if (!fetchedRoles.some(r => r.name === l.name)) {
              fetchedRoles.push(l);
            }
          }
          return fetchedRoles;
        }
        return this.loadLocalRoles();
      }),
      catchError(error => {
        console.warn('Could not fetch roles from backend http://localhost:8080/api/v1/role:', error);
        return of(this.loadLocalRoles());
      }),
      tap(allRoles => {
        this.roles.set(allRoles);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Create a new role via POST http://localhost:8080/api/v1/role
   */
  createRole(payload: CreateRoleRequest): Observable<RoleDto> {
    this.isSaving.set(true);

    const formattedPayload: CreateRoleRequest = {
      name: payload.name.trim().toUpperCase(),
      displayName: payload.displayName.trim(),
      description: payload.description?.trim() || ''
    };

    return this.http.post<unknown>(this.API_URL, formattedPayload).pipe(
      map(response => {
        const respObj = response as Record<string, unknown>;
        const rawRole = (respObj['data'] || response) as RoleDto;
        const newRole: RoleDto = {
          id: rawRole.id || 'ROLE-' + Date.now(),
          name: formattedPayload.name,
          displayName: formattedPayload.displayName,
          description: formattedPayload.description,
          createdAt: new Date().toISOString(),
          userCount: 0,
          isSystemRole: false
        };
        return newRole;
      }),
      catchError((error: HttpErrorResponse) => {
        console.warn('Backend POST role failed, creating locally:', error);
        const newRole: RoleDto = {
          id: 'ROLE-' + Date.now(),
          name: formattedPayload.name,
          displayName: formattedPayload.displayName,
          description: formattedPayload.description,
          createdAt: new Date().toISOString(),
          userCount: 0,
          isSystemRole: false
        };
        return of(newRole);
      }),
      tap(createdRole => {
        this.isSaving.set(false);
        this.saveLocalRole(createdRole);
        const current = [...this.roles()];
        if (!current.some(r => r.name === createdRole.name)) {
          this.roles.set([createdRole, ...current]);
        }
        this.toast.success('Role Created', `Role ${createdRole.displayName} (${createdRole.name}) has been created successfully.`);
      })
    );
  }

  private extractRoles(response: unknown): RoleDto[] {
    if (!response) return [];
    if (Array.isArray(response)) return response as RoleDto[];
    const res = response as Record<string, unknown>;
    if (Array.isArray(res['data'])) return res['data'] as RoleDto[];
    if (Array.isArray(res['roles'])) return res['roles'] as RoleDto[];
    if (Array.isArray(res['content'])) return res['content'] as RoleDto[];
    return [];
  }

  private getInitialRoles(): RoleDto[] {
    const local = this.loadLocalRoles();
    if (local && local.length > 0) return local;

    return [
      {
        id: 'R-001',
        name: 'ROLE_SUPER_ADMIN',
        displayName: 'Super Admin',
        description: 'Full root access to global platform configurations, organizations, and user features.',
        isSystemRole: true,
        userCount: 1,
        createdAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'R-002',
        name: 'ROLE_COMPANY_ADMIN',
        displayName: 'Company Admin',
        description: 'Administrative control over specific enterprise subsidiary, departments, and payroll.',
        isSystemRole: true,
        userCount: 3,
        createdAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'R-003',
        name: 'ROLE_HR_MANAGER',
        displayName: 'HR Manager',
        description: 'Management of employee directories, leaves, attendance records, and recruitment pipelines.',
        isSystemRole: true,
        userCount: 5,
        createdAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'R-004',
        name: 'ROLE_EMPLOYEE',
        displayName: 'Employee',
        description: 'Standard access to personal workspace, self-service leave requests, and payslips.',
        isSystemRole: true,
        userCount: 42,
        createdAt: '2026-01-01T00:00:00Z'
      }
    ];
  }

  private loadLocalRoles(): RoleDto[] {
    if (typeof window === 'undefined' || !window.localStorage) return this.getInitialRoles();
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignored
    }
    return this.getInitialRoles();
  }

  private saveLocalRole(role: RoleDto): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const list = this.loadLocalRoles();
      if (!list.some(r => r.name === role.name)) {
        list.unshift(role);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      }
    } catch {
      // Ignored
    }
  }
}
