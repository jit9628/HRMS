import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { CompanyProfile } from '../models/company.model';

@Injectable({ providedIn: 'root' })
export class CompanyApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://hrms.divijixtechnology.com/api/v1/companies';

  registerCompany(company: Partial<CompanyProfile>): Observable<CompanyProfile> {
    return this.http.post<ApiResponse<CompanyProfile>>(this.API_URL, company).pipe(
      map(response => response.data)
    );
  }

  updateCompany(company: Partial<CompanyProfile>): Observable<CompanyProfile> {
    return this.http.post<ApiResponse<CompanyProfile>>(this.API_URL, company).pipe(
      map(response => response.data)
    );
  }

  getCompanies(): Observable<CompanyProfile[]> {
    return this.http.get<ApiResponse<CompanyProfile[]>>(this.API_URL).pipe(
      map(response => response.data || [])
    );
  }
}

