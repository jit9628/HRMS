export type UserRole = 'Super Admin' | 'Company Admin' | 'Admin' | 'HR Manager' | 'Employee';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department: string;
  avatarInitials: string;
  token: string;
  companyId: string;
  companyName: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
