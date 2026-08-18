export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated' | 'Probation';

export interface Employee {
  id: string;
  companyId: string;
  companyName: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  department: string;
  designation: string;
  joinDate: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  salary: number;
  managerName?: string;
  location: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    pan: string;
  };
}

export interface Department {
  id: string;
  companyId: string;
  name: string;
  code: string;
  headOfDepartment: string;
  totalEmployees: number;
  color: string;
}

export interface Designation {
  id: string;
  companyId?: string;
  title: string;
  department: string;
  level: string;
}
