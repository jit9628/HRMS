import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/auth.model';

export interface DepartmentDto {
  id: string;
  companyId: string;
  name: string;
  code: string;
  headOfDepartment: string;
  totalEmployees: number;
  color: string;
}

export interface CreateDepartmentRequest {
  companyId?: string;
  name: string;
  code: string;
  headOfDepartment?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://hrms-backend-her1.onrender.com/api/v1/departments';

  getDepartments(companyId?: string): Observable<DepartmentDto[]> {
    const url = companyId ? `${this.API_URL}?companyId=${companyId}` : this.API_URL;
    return this.http.get<ApiResponse<DepartmentDto[]>>(url).pipe(
      map(res => res.data || [])
    );
  }

  createDepartment(dept: CreateDepartmentRequest): Observable<DepartmentDto> {
    return this.http.post<ApiResponse<DepartmentDto>>(this.API_URL, dept).pipe(
      map(res => res.data)
    );
  }

  deleteDepartment(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      map(() => void 0)
    );
  }
}
