export type UserRole = 'Super Admin' | 'Company Admin' | 'Admin' | 'HR Manager' | 'Employee';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  designation: string;
  department: string;
  avatarInitials: string;
  token: string;
  companyId: string;
  companyName: string;
  employeeId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface LoginResponseData {
  token: string;
  tokenType: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    roles?: string[];
    designation: string;
    department: string;
    avatarInitials: string;
    companyId: string;
    companyName: string;
    employeeId?: string;
  };
}
