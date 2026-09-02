import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, of, catchError, throwError } from 'rxjs';
import { AuthUser, UserRole, ApiResponse, LoginResponseData, LoginCredentials } from '../models/auth.model';
import { CompanyProfile } from '../models/company.model';
import { NotificationService } from './notification.service';

export const DEFAULT_DEMO_USERS: Record<string, AuthUser> = {
  'Super Admin': {
    id: 'EMP-1001',
    name: 'Jitendra Shukla',
    email: 'admin@hrms.internal',
    role: 'Super Admin',
    designation: 'Platform Administrator',
    department: 'Executive Administration',
    avatarInitials: 'JS',
    token: 'jwt-token-superadmin-2026',
    companyId: 'COMP-001',
    companyName: 'Acme Technologies Inc.'
  },
  'Company Admin': {
    id: 'EMP-1002',
    name: 'Jitendra Shukla',
    email: 'jitendra@hrms.internal',
    role: 'Company Admin',
    designation: 'Principal Architect',
    department: 'Engineering',
    avatarInitials: 'JS',
    token: 'jwt-token-companyadmin-jitendra-2026',
    companyId: 'COMP-001',
    companyName: 'Acme Technologies Inc.'
  },
  'HR Manager': {
    id: 'EMP-1003',
    name: 'Sophia Loren',
    email: 'hr@hrms.internal',
    role: 'HR Manager',
    designation: 'VP of People & Culture',
    department: 'Human Resources',
    avatarInitials: 'SL',
    token: 'jwt-token-hr-sophia-2026',
    companyId: 'COMP-001',
    companyName: 'Acme Technologies Inc.'
  },
  'Employee': {
    id: 'EMP-1004',
    name: 'Alex Rivera',
    email: 'alex@hrms.internal',
    role: 'Employee',
    designation: 'Senior Fullstack Engineer',
    department: 'Engineering',
    avatarInitials: 'AR',
    token: 'jwt-token-emp-alex-2026',
    companyId: 'COMP-001',
    companyName: 'Acme Technologies Inc.'
  }
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toast = inject(NotificationService);
  private readonly AUTH_KEY = 'pulse_hrms_auth_user';
  private readonly API_AUTH_URL = 'http://localhost:8080/api/v1/auth';

  // Demo user profiles
  readonly demoUsers: Record<string, AuthUser> = DEFAULT_DEMO_USERS;

  readonly currentUser = signal<AuthUser | null>(this.loadStoredUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
        } else {
          localStorage.removeItem(this.AUTH_KEY);
        }
      }
    });
  }

  /**
   * Real Backend API Login Call to POST http://localhost:8080/api/v1/auth/login
   */
  login(credentials: LoginCredentials): Observable<AuthUser> {
    const payload = {
      email: credentials.email.trim(),
      password: credentials.password
    };

    return this.http.post<ApiResponse<LoginResponseData>>(`${this.API_AUTH_URL}/login`, payload).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Login failed');
        }

        const data = response.data;
        const u = data.user;

        const authUser: AuthUser = {
          id: u.id || 'USER-' + Date.now(),
          name: u.name,
          email: u.email,
          role: (u.role as UserRole) || 'Super Admin',
          designation: u.designation || 'Staff',
          department: u.department || 'Operations',
          avatarInitials: u.avatarInitials || u.name.substring(0, 2).toUpperCase(),
          token: data.token,
          companyId: u.companyId || 'COMP-001',
          companyName: u.companyName || 'Acme Technologies Inc.',
          employeeId: u.employeeId
        };

        this.currentUser.set(authUser);
        this.toast.success(`Welcome back, ${authUser.name}`, `Signed in successfully.`);
        return authUser;
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMsg = 'Invalid email or password';
        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.status === 0) {
          errorMsg = 'Could not connect to backend server at http://localhost:8080. Please ensure the Spring Boot application is running.';
        }
        this.toast.error('Authentication Failed', errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Create / Register a Super Admin User Account
   */
  registerSuperAdmin(data: {
    name: string;
    email: string;
    password: string;
    designation?: string;
    department?: string;
    companyName?: string;
  }): Observable<AuthUser> {
    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      role: 'Super Admin',
      designation: data.designation || 'Platform Administrator',
      department: data.department || 'Executive Administration',
      companyName: data.companyName || 'Acme Technologies Inc.'
    };

    return this.http.post<ApiResponse<LoginResponseData>>(`${this.API_AUTH_URL}/register`, payload).pipe(
      map(response => {
        const u = response.data?.user;
        const authUser: AuthUser = {
          id: u?.id || 'ADM-' + Date.now(),
          name: u?.name || payload.name,
          email: u?.email || payload.email,
          role: 'Super Admin',
          designation: u?.designation || payload.designation,
          department: u?.department || payload.department,
          avatarInitials: (u?.name || payload.name).substring(0, 2).toUpperCase(),
          token: response.data?.token || 'jwt-token-superadmin-' + Date.now(),
          companyId: u?.companyId || 'COMP-001',
          companyName: u?.companyName || payload.companyName
        };

        this.currentUser.set(authUser);
        this.toast.success(`Super Admin Created`, `Account registered for ${authUser.name}.`);
        return authUser;
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMsg = 'Failed to register Super Admin on database';
        if (error.error?.message) {
          errorMsg = error.error.message;
        }
        this.toast.error('Registration Failed', errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  quickLogin(role: string): void {
    const user = this.demoUsers[role] || this.demoUsers['Super Admin'];
    if (user) {
      this.currentUser.set(user);
      this.toast.success(`Demo Access Granted`, `Logged in as ${user.name} (${user.companyName}).`);
      this.router.navigate(['/dashboard']);
    }
  }

  quickCompanyLogin(company: CompanyProfile): void {
    const user: AuthUser = {
      id: 'ADM-' + company.code,
      name: `${company.companyName} Admin`,
      email: company.email,
      role: 'Company Admin',
      designation: 'Enterprise Corporate Administrator',
      department: 'Executive Administration',
      avatarInitials: company.companyName.substring(0, 2).toUpperCase(),
      token: 'jwt-token-company-' + company.code + '-' + Date.now(),
      companyId: company.id,
      companyName: company.companyName
    };

    this.currentUser.set(user);
    this.toast.success(`Company Portal Access`, `Logged in as Administrator for ${company.companyName}.`);
    this.router.navigate(['/dashboard']);
  }

  switchCompany(company: CompanyProfile): void {
    const current = this.currentUser();
    if (current) {
      const updated: AuthUser = {
        ...current,
        companyId: company.id,
        companyName: company.companyName
      };
      this.currentUser.set(updated);
      this.toast.info('Active Organization Switched', `Now managing ${company.companyName}.`);
    }
  }

  logout(): void {
    const user = this.currentUser();
    this.currentUser.set(null);

    // Completely clear all localStorage and sessionStorage keys
    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        window.localStorage.clear();
      }
      if (window.sessionStorage) {
        window.sessionStorage.clear();
      }
    }

    if (user) {
      this.toast.info('Signed Out', `${user.name} has been logged out.`);
    }
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.currentUser()?.token || null;
  }

  private loadStoredUser(): AuthUser | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.AUTH_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}
