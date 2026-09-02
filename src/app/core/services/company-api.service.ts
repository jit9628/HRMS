import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { CompanyProfile } from '../models/company.model';

export interface CreateCompanyRequest {
  companyName: string;
  tagline?: string;
  type: CompanyProfile['type'];
  industry?: string;
  status: CompanyProfile['status'];
  registrationNumber: string;
  taxId: string;
  email: string;
  phone?: string;
  website?: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  currency?: string;
  timeZone?: string;
  brandColor?: string;
  isDefault?: boolean;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface CreateCompanyAdminRequest {
  name: string;
  email: string;
  password: string;
  role: 'Company Admin';
  companyId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/v1/companies';

  createCompany(company: CreateCompanyRequest): Observable<CompanyProfile> {
    return this.http.post<ApiResponse<CompanyProfile>>(`${this.API_URL}`, company).pipe(
      map(response => response.data)
    );
  }

  createCompanyAdmin(admin: CreateCompanyAdminRequest): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>('http://localhost:8080/api/v1/auth/register', admin).pipe(
      map(response => response.data)
    );
  }
}
