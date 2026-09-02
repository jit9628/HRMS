export interface RoleDto {
  id?: string | number;
  name: string; // e.g. 'ROLE_FINANCE_MANAGER' or 'FINANCE_MANAGER', regex: ^[A-Z0-9_]+$, min 2, max 100
  displayName: string; // max 150 chars
  description?: string; // max 500 chars
  createdAt?: string;
  userCount?: number;
  isSystemRole?: boolean;
}

export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description?: string;
}

export interface RoleApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}
