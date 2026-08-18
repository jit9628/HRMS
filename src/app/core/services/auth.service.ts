import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser, UserRole } from '../models/auth.model';
import { CompanyProfile } from '../models/company.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly toast = inject(NotificationService);
  private readonly AUTH_KEY = 'pulse_hrms_auth_user';

  readonly currentUser = signal<AuthUser | null>(this.loadStoredUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());

  // Demo user profiles
  readonly demoUsers: Record<string, AuthUser> = {
    'Super Admin': {
      id: 'EMP-1001',
      name: 'Jitendra Shukla',
      email: 'admin@pulsehrms.com',
      role: 'Super Admin',
      designation: 'Principal Architect & System Admin',
      department: 'Engineering',
      avatarInitials: 'JS',
      token: 'jwt-token-superadmin-jitendra-2026',
      companyId: 'CMP-101',
      companyName: 'Pulse Technologies India Pvt Ltd'
    },
    'Company Admin': {
      id: 'EMP-1007',
      name: 'Arjun Kapoor',
      email: 'mumbai.admin@pulsehrms.com',
      role: 'Company Admin',
      designation: 'Managing Director & Branch Head',
      department: 'Management',
      avatarInitials: 'AK',
      token: 'jwt-token-companyadmin-arjun-2026',
      companyId: 'CMP-102',
      companyName: 'Pulse Cloud Solutions Mumbai Ltd'
    },
    'HR Manager': {
      id: 'EMP-1004',
      name: 'Priya Nair',
      email: 'hr@pulsehrms.com',
      role: 'HR Manager',
      designation: 'VP of People & Culture',
      department: 'Human Resources',
      avatarInitials: 'PN',
      token: 'jwt-token-hr-priya-nair-2026',
      companyId: 'CMP-101',
      companyName: 'Pulse Technologies India Pvt Ltd'
    },
    'Employee': {
      id: 'EMP-1003',
      name: 'Vikram Patel',
      email: 'employee@pulsehrms.com',
      role: 'Employee',
      designation: 'Senior Frontend Engineer',
      department: 'Engineering',
      avatarInitials: 'VP',
      token: 'jwt-token-emp-vikram-patel-2026',
      companyId: 'CMP-101',
      companyName: 'Pulse Technologies India Pvt Ltd'
    }
  };

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

  login(email: string, password: string, company?: CompanyProfile): boolean {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Check against demo accounts
    let matchedUser: AuthUser | null = null;
    if (trimmedEmail === 'admin@pulsehrms.com' || trimmedEmail === 'jitendra@pulsehrms.com') {
      matchedUser = this.demoUsers['Super Admin'];
    } else if (trimmedEmail === 'mumbai.admin@pulsehrms.com') {
      matchedUser = this.demoUsers['Company Admin'];
    } else if (trimmedEmail === 'hr@pulsehrms.com' || trimmedEmail === 'priya@pulsehrms.com') {
      matchedUser = this.demoUsers['HR Manager'];
    } else if (trimmedEmail === 'employee@pulsehrms.com' || trimmedEmail === 'vikram@pulsehrms.com') {
      matchedUser = this.demoUsers['Employee'];
    } else if (trimmedEmail.includes('@') && password.length >= 4) {
      // Allow custom email login with company profile
      const nameParts = trimmedEmail.split('@')[0].split('.');
      const first = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Member';
      const last = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'User';
      
      const compId = company ? company.id : 'CMP-101';
      const compName = company ? company.companyName : 'Pulse Technologies India Pvt Ltd';

      matchedUser = {
        id: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
        name: `${first} ${last}`,
        email: trimmedEmail,
        role: trimmedEmail.startsWith('admin') ? 'Company Admin' : 'Employee',
        designation: 'Corporate Staff',
        department: 'Operations',
        avatarInitials: (first[0] + (last[0] || first[1] || 'U')).toUpperCase(),
        token: 'jwt-token-custom-' + Date.now(),
        companyId: compId,
        companyName: compName
      };
    }

    if (matchedUser) {
      this.currentUser.set(matchedUser);
      this.toast.success(`Welcome, ${matchedUser.name}`, `Signed into ${matchedUser.companyName} as ${matchedUser.role}.`);
      return true;
    } else {
      this.toast.error('Authentication Failed', 'Please provide a valid email and password (min 4 chars).');
      return false;
    }
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
    if (user) {
      this.toast.info('Signed Out', `${user.name} has been logged out.`);
    }
    this.router.navigate(['/login']);
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
