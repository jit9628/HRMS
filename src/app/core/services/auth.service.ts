import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { AuthUser, UserRole, ApiResponse, LoginResponseData, LoginCredentials } from '../models/auth.model';
import { CompanyProfile } from '../models/company.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toast = inject(NotificationService);
  private readonly AUTH_KEY = 'pulse_hrms_auth_user';
  private readonly API_AUTH_URL = 'https://hrms-backend-her1.onrender.com/api/v1/auth';

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
   * Real Backend API Login Call to POST https://hrms-backend-her1.onrender.com/api/v1/auth/login
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
          role: (u.role as UserRole) || 'Employee',
          roles: (u.roles || [u.role]).map(role => role as UserRole),
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
          errorMsg = 'Could not connect to backend server at https://hrms-backend-her1.onrender.com. Please ensure the Spring Boot application is running.';
        }
        this.toast.error('Authentication Failed', errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  registerCredentials(credentials: {
    name: string;
    email: string;
    password: string;
    companyId: string;
    companyName: string;
  }): Observable<{ data: AuthUser }> {
    return this.http.post<{ data: AuthUser }>(`${this.API_AUTH_URL}/register-credentials`, {
      ...credentials,
      designation: 'Company User',
      department: 'Administration'
    });
  }

  assignRoles(userId: string, roles: string[]): Observable<AuthUser> {
    return this.http.put<{ data: AuthUser }>(`https://hrms-backend-her1.onrender.com/api/v1/users/${userId}/role`, { roles }).pipe(
      map(response => response.data)
    );
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
