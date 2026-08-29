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
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    RouterModule, 
    IconComponent, 
    ToastContainerComponent
  ],
  templateUrl:'./login.component.html',
  styleUrls: ['./login.component.scss']
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
