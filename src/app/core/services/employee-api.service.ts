import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/v1/employees';

  getEmployees(): Observable<Employee[]> {
    return this.http.get<ApiResponse<Employee[]>>(`${this.API_URL}/all`).pipe(
      map(response => response.data || [])
    );
  }

  createEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    return this.http.post<ApiResponse<Employee>>(this.API_URL, employee).pipe(
      map(response => response.data)
    );
  }
}
