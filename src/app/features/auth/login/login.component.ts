import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { HrmsDataService } from '../../../core/services/hrms-data.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ToastContainerComponent } from '../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, IconComponent, ToastContainerComponent],
  template: `
    <div class="login-container">
      <!-- Theme Switcher Floating Top Right -->
      <button 
        type="button" 
        class="theme-float-btn" 
        (click)="themeService.toggleTheme()"
        [title]="'Switch to ' + (themeService.currentTheme() === 'light' ? 'Dark' : 'Light') + ' Mode'">
        <app-icon [name]="themeService.currentTheme() === 'light' ? 'moon' : 'sun'" [size]="20"></app-icon>
      </button>

      <div class="login-wrapper">
        <!-- Left Side: Brand Showcase -->
        <div class="login-brand-side">
          <div class="brand-top">
            <div class="brand-logo">
              <div class="logo-icon-box">
                <app-icon name="award" [size]="28"></app-icon>
              </div>
              <div class="brand-title">
                <h1>Pulse<span>HRMS</span></h1>
                <span class="brand-badge">Multi-Company v19.2</span>
              </div>
            </div>
            <p class="brand-tagline">Multi-tenant workforce intelligence platform with autonomous company department & employee management.</p>
          </div>

          <!-- Feature Bullets -->
          <div class="feature-bullets">
            <div class="feature-item">
              <div class="feat-icon"><app-icon name="building" [size]="18"></app-icon></div>
              <div>
                <h4>Multi-Company Workspaces</h4>
                <p>Each company manages its own custom departments, designations, and employees.</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feat-icon"><app-icon name="users" [size]="18"></app-icon></div>
              <div>
                <h4>Company-Scoped Employee Directory</h4>
                <p>Isolated staff rosters with independent attendance & payroll runs.</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feat-icon"><app-icon name="dollar-sign" [size]="18"></app-icon></div>
              <div>
                <h4>Compliant Payroll & Payslips</h4>
                <p>Custom tax IDs, GSTIN calculation, and automated slips per entity.</p>
              </div>
            </div>
          </div>

          <!-- Registered Companies Pills Preview -->
          <div class="companies-preview-box">
            <span class="c-title">REGISTERED CORPORATE ENTITIES ({{ companies().length }}):</span>
            <div class="companies-chip-list">
              @for (c of companies(); track c.id) {
                <div class="company-chip" (click)="selectCompany(c.id)">
                  <span class="chip-dot" [style.background]="c.brandColor || 'var(--primary-500)'"></span>
                  <span class="chip-name">{{ c.companyName }}</span>
                  <span class="chip-code font-mono">{{ c.code }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Security & Compliance Footer -->
          <div class="brand-footer">
            <span class="security-tag">
              <app-icon name="check-circle" [size]="14"></app-icon>
              <span>SOC-2 Type II Certified • 256-Bit TLS Multi-Tenant Isolation</span>
            </span>
          </div>
        </div>

        <!-- Right Side: Login Form & Quick Portals -->
        <div class="login-form-side card">
          <div class="form-header">
            <h2>Sign In to Workspace</h2>
            <p>Access your corporate portal or sign in with your enterprise credentials.</p>
          </div>

          <!-- Login Mode Tabs: Company Portals vs Role Login -->
          <div class="login-tabs">
            <button 
              type="button" 
              class="tab-btn" 
              [class.active]="activeTab() === 'companies'"
              (click)="activeTab.set('companies')">
              <app-icon name="building" [size]="16"></app-icon>
              <span>Company Portals ({{ companies().length }})</span>
            </button>

            <button 
              type="button" 
              class="tab-btn" 
              [class.active]="activeTab() === 'roles'"
              (click)="activeTab.set('roles')">
              <app-icon name="users" [size]="16"></app-icon>
              <span>Direct Roles</span>
            </button>
          </div>

          @if (activeTab() === 'companies') {
            <!-- Registered company directory -->
            <div class="company-portals-section">
              <div class="portal-grid">
                @for (c of companies(); track c.id) {
                  <div class="company-portal-card card-hover" (click)="selectCompany(c.id)">
                    <div class="c-portal-left">
                      <div class="c-portal-avatar" [style.background]="c.brandColor || 'var(--primary-600)'">
                        <app-icon name="building" [size]="20"></app-icon>
                      </div>
                      <div class="c-portal-text">
                        <div class="c-portal-name">{{ c.companyName }}</div>
                        <div class="c-portal-sub">
                          <span class="badge badge-sm badge-neutral">{{ c.type }}</span>
                          <span class="c-city">📍 {{ c.city }}, {{ c.country }}</span>
                        </div>
                      </div>
                    </div>
                    <button type="button" class="btn btn-primary btn-sm portal-enter-btn">
                      <span>Enter</span>
                      <app-icon name="chevron-right" [size]="14"></app-icon>
                    </button>
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="credentials-only-message">
              Sign in with your enterprise credentials to continue.
            </div>
          }

          <div class="or-divider">
            <span>OR SIGN IN WITH CREDENTIALS</span>
          </div>

          <!-- Credentials Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label>Select Target Company</label>
              <select class="form-control" formControlName="selectedCompanyId">
                @for (c of companies(); track c.id) {
                  <option [value]="c.id">{{ c.companyName }} ({{ c.city }})</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>Work Email Address</label>
              <div class="input-icon-wrapper">
                <span class="input-icon"><app-icon name="mail" [size]="18"></app-icon></span>
                <input 
                  type="email" 
                  class="form-control" 
                  formControlName="email" 
                  placeholder="admin@hrms.internal"
                />
              </div>
              @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
                <span class="form-error">Please enter a valid email address.</span>
              }
            </div>

            <div class="form-group">
              <div class="flex-between">
                <label>Password</label>
                <a href="javascript:void(0)" class="forgot-link" (click)="showForgotHint.set(true)">Forgot password?</a>
              </div>
              <div class="input-icon-wrapper">
                <span class="input-icon"><app-icon name="briefcase" [size]="18"></app-icon></span>
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  class="form-control password-input" 
                  formControlName="password" 
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  class="password-toggle-btn" 
                  (click)="toggleShowPassword()"
                  [title]="showPassword() ? 'Hide password' : 'Show password'"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
                  <app-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="18"></app-icon>
                </button>
              </div>
              @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
                <span class="form-error">Password must be at least 4 characters.</span>
              }
            </div>

            @if (showForgotHint()) {
              <div class="forgot-hint-box">
                <app-icon name="alert-circle" [size]="16"></app-icon>
                <span>Please contact your administrator to reset your password.</span>
              </div>
            }

            <div class="form-row-remember flex-between">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="rememberMe" />
                <span>Remember this device for 30 days</span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-block" [disabled]="loginForm.invalid || isLoading()">
              @if (isLoading()) {
                <span>Authenticating...</span>
              } @else {
                <span>Sign In to Company Workspace</span>
                <app-icon name="chevron-right" [size]="18"></app-icon>
              }
            </button>
          </form>
        </div>
      </div>

      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      width: 100%;
      background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 40%),
                  radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
                  var(--bg-app);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      position: relative;
    }

    .theme-float-btn {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      width: 42px;
      height: 42px;
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
      z-index: 10;

      &:hover {
        background: var(--bg-surface-subtle);
        transform: scale(1.05);
      }
    }

    .login-wrapper {
      width: 100%;
      max-width: 1100px;
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-xl);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .login-brand-side {
      background: linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%);
      color: #ffffff;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 250px;
        height: 250px;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
        pointer-events: none;
      }

      .brand-top {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.875rem;

          .logo-icon-box {
            width: 48px;
            height: 48px;
            border-radius: var(--radius-lg);
            background: linear-gradient(135deg, var(--primary-500), var(--accent-purple));
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          }

          .brand-title {
            h1 {
              font-size: 1.625rem;
              font-weight: 800;
              letter-spacing: -0.03em;
              color: #ffffff;
              span { color: #818cf8; }
            }
            .brand-badge {
              font-size: 0.6875rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #c7d2fe;
            }
          }
        }

        .brand-tagline {
          font-size: 0.875rem;
          color: #94a3b8;
          line-height: 1.5;
        }
      }

      .feature-bullets {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        margin: 2rem 0;

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.875rem;

          .feat-icon {
            width: 34px;
            height: 34px;
            border-radius: var(--radius-md);
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #a5b4fc;
            flex-shrink: 0;
          }

          h4 {
            font-size: 0.875rem;
            font-weight: 600;
            color: #f8fafc;
          }

          p {
            font-size: 0.75rem;
            color: #94a3b8;
            margin-top: 0.125rem;
          }
        }
      }

      .companies-preview-box {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0.875rem;
        border-radius: var(--radius-md);
        margin-bottom: 1.5rem;

        .c-title {
          font-size: 0.6875rem;
          font-weight: 700;
          color: #c7d2fe;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 0.5rem;
        }

        .companies-chip-list {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;

          .company-chip {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255, 255, 255, 0.06);
            padding: 0.375rem 0.625rem;
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: all var(--transition-fast);

            &:hover {
              background: rgba(255, 255, 255, 0.12);
              transform: translateX(2px);
            }

            .chip-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              margin-right: 0.5rem;
            }

            .chip-name {
              font-size: 0.75rem;
              color: #f8fafc;
              flex: 1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .chip-code {
              font-size: 0.625rem;
              color: #94a3b8;
            }
          }
        }
      }

      .brand-footer {
        .security-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.6875rem;
          color: #64748b;
          font-weight: 600;
        }
      }
    }

    .login-form-side {
      padding: 2.5rem 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: var(--bg-surface);

      @media (max-width: 600px) {
        padding: 1.5rem;
      }

      .form-header {
        margin-bottom: 1.25rem;

        h2 {
          font-size: 1.375rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        p {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
      }

      .login-tabs {
        display: flex;
        background: var(--bg-surface-subtle);
        padding: 0.25rem;
        border-radius: var(--radius-md);
        margin-bottom: 1.25rem;
        gap: 0.25rem;

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);

          &.active {
            background: var(--bg-surface);
            color: var(--primary-600);
            box-shadow: var(--shadow-sm);
          }
        }
      }

      .company-portals-section {
        margin-bottom: 1.25rem;

        .portal-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .company-portal-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.625rem 0.875rem;
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);

          &:hover {
            border-color: var(--primary-400);
            background: var(--bg-surface);
            transform: translateY(-1px);
          }

          .c-portal-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;

            .c-portal-avatar {
              width: 36px;
              height: 36px;
              border-radius: var(--radius-md);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              flex-shrink: 0;
            }

            .c-portal-text {
              display: flex;
              flex-direction: column;

              .c-portal-name {
                font-size: 0.8125rem;
                font-weight: 700;
                color: var(--text-main);
              }

              .c-portal-sub {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-top: 0.125rem;

                .c-city {
                  font-size: 0.6875rem;
                  color: var(--text-muted);
                }
              }
            }
          }

          .portal-enter-btn {
            padding: 0.25rem 0.625rem;
            font-size: 0.6875rem;
          }
        }
      }

      .quick-demo-section {
        margin-bottom: 1.25rem;

        .demo-buttons-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;

          @media (max-width: 500px) {
            grid-template-columns: 1fr;
          }

          .demo-btn {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            padding: 0.5rem 0.625rem;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-color);
            background: var(--bg-surface-subtle);
            cursor: pointer;
            text-align: left;
            transition: all var(--transition-fast);

            &:hover {
              border-color: var(--primary-400);
              background: var(--bg-surface);
              transform: translateY(-2px);
              box-shadow: var(--shadow-sm);
            }

            .demo-avatar {
              width: 32px;
              height: 32px;
              border-radius: var(--radius-full);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.6875rem;
              font-weight: 700;
              flex-shrink: 0;
            }

            .demo-info {
              display: flex;
              flex-direction: column;
              overflow: hidden;

              .role-name {
                font-size: 0.75rem;
                font-weight: 700;
                color: var(--text-main);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .user-sub {
                font-size: 0.625rem;
                color: var(--text-muted);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }

            &.admin-btn .demo-avatar { background: rgba(99, 102, 241, 0.15); color: var(--primary-600); }
            &.hr-btn .demo-avatar { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
            &.emp-btn .demo-avatar { background: rgba(16, 185, 129, 0.15); color: var(--success-600); }
          }
        }
      }

      .or-divider {
        display: flex;
        align-items: center;
        text-align: center;
        margin: 0.75rem 0;
        color: var(--text-subtle);

        &::before, &::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-color);
        }

        span {
          padding: 0 0.75rem;
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
      }

      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .password-input {
          padding-right: 2.75rem;
        }

        .password-toggle-btn {
          position: absolute;
          right: 0.75rem;
          color: var(--text-subtle);
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          &:hover { color: var(--primary-600); }
        }

        .forgot-link {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--primary-600);
        }

        .form-error {
          font-size: 0.75rem;
          color: var(--danger-600);
          margin-top: 0.25rem;
        }

        .forgot-hint-box {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.625rem;
          border-radius: var(--radius-md);
          background: var(--info-50);
          border: 1px solid var(--info-100);
          color: var(--info-700);
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .form-row-remember {
          margin: 0.5rem 0 0.75rem;

          .checkbox-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            color: var(--text-muted);
            cursor: pointer;

            input {
              accent-color: var(--primary-600);
              cursor: pointer;
            }
          }
        }

        .btn-block {
          width: 100%;
        }
      }
    }

    .font-mono { font-family: var(--font-mono); }
  `]
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly hrmsData = inject(HrmsDataService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly themeService = inject(ThemeService);

  readonly companies = this.hrmsData.companies;
  readonly activeTab = signal<'companies' | 'roles'>('companies');

  loginForm!: FormGroup;
  readonly showPassword = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly showForgotHint = signal<boolean>(false);

  private returnUrl = '/dashboard';

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // If already authenticated, go directly to returnUrl
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl);
    }

    const defaultComp = this.companies()[0]?.id || '';

    this.loginForm = this.fb.group({
      selectedCompanyId: [defaultComp],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rememberMe: [false]
    });
  }

  selectCompany(companyId: string): void {
    this.loginForm.patchValue({ selectedCompanyId: companyId });
  }

  toggleShowPassword(): void {
    this.showPassword.update(s => !s);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
