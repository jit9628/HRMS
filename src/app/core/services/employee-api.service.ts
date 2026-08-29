import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { Employee } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://hrms-backend-her1.onrender.com/api/v1/employees';

  createEmployee(employee: Partial<Employee>): Observable<Employee> {
    return this.http.post<ApiResponse<Employee>>(this.API_URL, employee).pipe(
      map(response => response.data)
    );
  }
}