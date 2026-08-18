export type CompanyType = 'Headquarters' | 'Subsidiary' | 'Regional Branch' | 'Sister Entity';
export type CompanyStatus = 'Active' | 'Under Review' | 'Inactive';

export interface CompanyProfile {
  id: string;
  code: string;
  companyName: string;
  tagline: string;
  industry: string;
  type: CompanyType;
  status: CompanyStatus;
  website: string;
  taxId: string; // GSTIN / Tax ID
  registrationNumber: string; // CIN / LLPIN
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  currency: string;
  timeZone: string;
  totalEmployees: number;
  totalDepartments: number;
  isDefault: boolean;
  brandColor?: string;
  establishedDate?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  category: 'Event' | 'Policy' | 'Update' | 'Celebration';
  priority: 'Normal' | 'Urgent';
}
