import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface UserFeature {
  id: string;
  code: string;
  title: string;
  path: string;
  icon: string;
  category: string;
  orderIndex: number;
  badge?: number;
  enabled: boolean;
  permissions?: string[];
  children?: UserFeature[];
  isOpen?: boolean;
}

export interface UserFeaturesResponse {
  userId?: string;
  name?: string;
  email?: string;
  role?: string;
  features?: UserFeature[];
}

@Injectable({
  providedIn: 'root'
})
export class FeatureApiService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly API_URL = 'http://localhost:8080/api/v1/users/me/features';

  // Local storage key for persistent custom menu items or override
  private readonly STORAGE_KEY = 'pulse_hrms_custom_features';

  // Real-time signals
  readonly activeFeatures = signal<UserFeature[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly lastSyncStatus = signal<'synced' | 'fallback' | 'idle' | 'error'>('idle');

  /**
   * Super Admin Default Manage Menu Structure
   */
  readonly superAdminManageMenu: UserFeature = {
    id: 'feat-manage-menu',
    code: 'MANAGE_MENU',
    title: 'Manage Menu',
    path: '/manage-menu',
    icon: 'grid',
    category: 'ADMINISTRATION',
    orderIndex: 90,
    enabled: true,
    isOpen: true,
    children: [
      {
        id: 'feat-manage-menu-list',
        code: 'MENU_LIST',
        title: 'Menu List',
        path: '/manage-menu',
        icon: 'list',
        category: 'ADMINISTRATION',
        orderIndex: 1,
        enabled: true
      },
      {
        id: 'feat-add-menu',
        code: 'ADD_MENU',
        title: 'Add Menu',
        path: '/manage-menu/add',
        icon: 'plus',
        category: 'ADMINISTRATION',
        orderIndex: 2,
        enabled: true
      },
      // {
      //   id: 'feat-roles',
      //   code: 'MANAGE_ROLES',
      //   title: 'Roles (Super Admin)',
      //   path: '/roles',
      //   icon: 'shield',
      //   category: 'ADMINISTRATION',
      //   orderIndex: 3,
      //   enabled: true
      // }
    ]
  };

/**
 * Super Admin Default Manage Permissions Structure
 */
readonly superAdminManagePermissions: UserFeature = {
  id: 'feat-manage-permissions',
  code: 'MANAGE_PERMISSIONS',
  title: 'Manage Permissions',
  path: '/manage-permissions',
  icon: 'key',
  category: 'ADMINISTRATION',
  orderIndex: 91,
  enabled: true,
  isOpen: false,
  children: [
    {
      id: 'feat-permission-list',
      code: 'PERMISSION_LIST',
      title: 'Permission List',
      path: '/manage-permissions',
      icon: 'list',
      category: 'ADMINISTRATION',
      orderIndex: 1,
      enabled: true
    },
    {
      id: 'feat-assign-permissions',
      code: 'ASSIGN_PERMISSIONS',
      title: 'Assign Permissions',
      path: '/manage-permissions/assign',
      icon: 'user-check',
      category: 'ADMINISTRATION',
      orderIndex: 2,
      enabled: true
    }
  ]
};



  /**
   * Main call to GET http://localhost:8080/api/v1/users/me/features
   */
  getCurrentUserFeatures(): Observable<UserFeature[]> {
    this.isLoading.set(true);
    const currentUser = this.authService.currentUser();
    const role = currentUser?.role || 'Super Admin';
    const isSuperAdmin = role === 'Super Admin';

    return this.http.get<unknown>(this.API_URL).pipe(
      map(response => {
        const rawFeatures = this.extractFeaturesArray(response);
        let normalized = rawFeatures.map(item => this.normalizeFeature(item));

        this.lastSyncStatus.set('synced');

        // Merge locally created custom menus if any
        const customAdded = this.loadLocalCustomFeatures();
        if (customAdded && customAdded.length > 0) {
          for (const custom of customAdded) {
            if (!normalized.some(d => d.path === custom.path || d.code === custom.code)) {
              normalized.push(custom);
            }
          }
        }

        // Only for Super Admin, include Manage Menu if not already returned from database
        if (isSuperAdmin) {
          normalized = this.ensureSuperAdminManageMenu(normalized);
        }

        return normalized;
      }),
      catchError(error => {
        console.warn('Backend endpoint http://localhost:8080/api/v1/users/me/features unreachable / empty:', error);
        this.lastSyncStatus.set('error');

        // Strictly NO fake default menus
        let list: UserFeature[] = [];

        const customAdded = this.loadLocalCustomFeatures();
        if (customAdded && customAdded.length > 0) {
          list = [...customAdded];
        }

        if (isSuperAdmin) {
          list = this.ensureSuperAdminManageMenu(list);
        }

        return of(list);
      }),
      tap(features => {
        this.activeFeatures.set(features);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Helper to ensure Manage Menu parent and child items exist for Super Admin
   */
  private ensureSuperAdminManageMenu(list: UserFeature[]): UserFeature[] {
    const existingIndex = list.findIndex(
      f => f.code === 'MANAGE_MENU' || f.path === '/manage-menu' || f.title.toLowerCase().includes('manage menu')
    );

    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      if (!existing.children || existing.children.length === 0) {
        existing.children = [
          {
            id: 'feat-manage-menu-list',
            code: 'MENU_LIST',
            title: 'Menu List',
            path: '/manage-menu',
            icon: 'list',
            category: 'ADMINISTRATION',
            orderIndex: 1,
            enabled: true
          },
          {
            id: 'feat-add-menu',
            code: 'ADD_MENU',
            title: 'Add Menu',
            path: '/manage-menu/add',
            icon: 'plus',
            category: 'ADMINISTRATION',
            orderIndex: 2,
            enabled: true
          },

        ];
      }
      //  else if (!existing.children.some(c => c.path === '/roles' || c.code === 'MANAGE_ROLES')) {
      //   existing.children.push({
      //     id: 'feat-roles',
      //     code: 'MANAGE_ROLES',
      //     title: 'Roles (Super Admin)',
      //     path: '/roles',
      //     icon: 'shield',
      //     category: 'ADMINISTRATION',
      //     orderIndex: 3,
      //     enabled: true
      //   });
      // }
      existing.enabled = true;
    } 
    else {
      list.push(JSON.parse(JSON.stringify(this.superAdminManageMenu)));
    }
        // Ensure Manage Permissions menu is also present for Super Admin
        // 2. Ensure Manage Permissions
  const permissionIndex = list.findIndex(
    f => f.code === 'MANAGE_PERMISSIONS' || f.path === '/manage-permissions' || f.title?.toLowerCase().includes('manage permissions')
  );

  if (permissionIndex >= 0) {
    const existingPerm = list[permissionIndex];
    if (!existingPerm.children || existingPerm.children.length === 0) {
      existingPerm.children = [
        {
          id: 'feat-permission-list',
          code: 'PERMISSION_LIST',
          title: 'Permission List',
          path: '/manage-permissions',
          icon: 'list',
          category: 'ADMINISTRATION',
          orderIndex: 1,
          enabled: true
        },
        {
          id: 'feat-assign-permissions',
          code: 'ASSIGN_PERMISSIONS',
          title: 'Assign Permissions',
          path: '/manage-permissions/assign',
          icon: 'user-check',
          category: 'ADMINISTRATION',
          orderIndex: 2,
          enabled: true
        }
      ];
    }
    existingPerm.enabled = true;
  } else {
    list.push(JSON.parse(JSON.stringify(this.superAdminManagePermissions)));
  }














    
    return list;
  }

  /**
   * Flexible normalization for different backend response wrappers
   */
  private extractFeaturesArray(res: unknown): unknown[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;

    const r = res as Record<string, unknown>;

    // Case 1: ApiResponse with data.features
    if (r['data'] && typeof r['data'] === 'object') {
      const data = r['data'] as Record<string, unknown>;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data['features'])) return data['features'];
    }

    // Case 2: Direct object with features array
    if (Array.isArray(r['features'])) {
      return r['features'];
    }

    return [];
  }

  /**
   * Normalize an individual feature item from backend schema
   */
  private normalizeFeature(item: unknown): UserFeature {
    const it = (item || {}) as Record<string, unknown>;

    const id = String(it['id'] || it['featureId'] || it['code'] || 'feat-' + Math.random().toString(36).substring(2, 9));
    const code = String(it['code'] || it['key'] || id).toUpperCase();
    const title = String(it['title'] || it['name'] || it['label'] || it['featureName'] || 'Menu Item');

    let path = String(it['path'] || it['route'] || it['url'] || it['link'] || '');
    if (path && !path.startsWith('/') && !path.startsWith('http')) {
      path = '/' + path;
    }

    const icon = String(it['icon'] || it['iconName'] || 'grid');
    const category = String(it['category'] || it['section'] || it['module'] || 'CORE WORKSPACE');
    const orderIndex = Number(it['orderIndex'] ?? it['order'] ?? it['displayOrder'] ?? 50);
    const badge = it['badge'] !== undefined ? Number(it['badge']) : (it['badgeCount'] !== undefined ? Number(it['badgeCount']) : undefined);
    const enabled = it['enabled'] !== undefined ? Boolean(it['enabled']) : (it['active'] !== undefined ? Boolean(it['active']) : true);

    // Normalize child items recursively if present
    let children: UserFeature[] | undefined = undefined;
    const rawChildren = it['children'] || it['childMenus'] || it['subMenus'] || it['subItems'];
    if (Array.isArray(rawChildren) && rawChildren.length > 0) {
      children = rawChildren.map(c => this.normalizeFeature(c));
    }

    return {
      id,
      code,
      title,
      path,
      icon,
      category,
      orderIndex,
      badge,
      enabled,
      permissions: Array.isArray(it['permissions']) ? (it['permissions'] as string[]) : [],
      children,
      isOpen: false
    };
  }

  /**
   * Add a new dynamic menu
   */
  addCustomFeature(newFeature: Partial<UserFeature>, parentId?: string): UserFeature {
    const feature: UserFeature = {
      id: newFeature.id || 'feat-' + Date.now(),
      code: newFeature.code || (newFeature.title || 'CUSTOM').toUpperCase().replace(/\s+/g, '_'),
      title: newFeature.title || 'New Menu',
      path: newFeature.path?.startsWith('/') ? newFeature.path : ('/' + (newFeature.path || '')),
      icon: newFeature.icon || 'grid',
      category: newFeature.category || 'CUSTOM MODULES',
      orderIndex: newFeature.orderIndex ?? 100,
      enabled: newFeature.enabled ?? true,
      badge: newFeature.badge,
      children: newFeature.children || [],
      isOpen: false
    };

    const current = [...this.activeFeatures()];

    if (parentId) {
      const parent = current.find(f => f.id === parentId || f.code === parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(feature);
      } else {
        current.push(feature);
      }
    } else {
      current.push(feature);
    }

    this.activeFeatures.set(current);
    this.saveLocalCustomFeatures(feature);
    return feature;
  }

  /**
   * Toggle enable/disable status of a menu item
   */
  toggleFeatureStatus(featureId: string): void {
    const current = [...this.activeFeatures()];
    const updateRecursive = (list: UserFeature[]): boolean => {
      for (const item of list) {
        if (item.id === featureId || item.code === featureId) {
          item.enabled = !item.enabled;
          return true;
        }
        if (item.children && item.children.length > 0) {
          if (updateRecursive(item.children)) return true;
        }
      }
      return false;
    };

    updateRecursive(current);
    this.activeFeatures.set(current);
  }

  /**
   * Delete a custom menu item
   */
  deleteFeature(featureId: string): void {
    let current = this.activeFeatures().filter(f => f.id !== featureId && f.code !== featureId);
    current = current.map(f => {
      if (f.children) {
        f.children = f.children.filter(c => c.id !== featureId && c.code !== featureId);
      }
      return f;
    });

    this.activeFeatures.set(current);
    const custom = this.loadLocalCustomFeatures().filter(c => c.id !== featureId && c.code !== featureId);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(custom));
    }
  }

  private loadLocalCustomFeatures(): UserFeature[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveLocalCustomFeatures(feature: UserFeature): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const list = this.loadLocalCustomFeatures();
      list.push(feature);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignored
    }
  }
}
