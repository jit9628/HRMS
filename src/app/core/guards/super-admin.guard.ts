import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const superAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(NotificationService);

  const currentUser = authService.currentUser();

  if (currentUser && currentUser.role === 'Super Admin') {
    return true;
  }

  toast.error('Access Denied', 'Only Super Admin can access Role Management.');
  return router.createUrlTree(['/dashboard']);
};
