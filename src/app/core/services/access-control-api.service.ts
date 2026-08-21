import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, AuthUser } from '../models/auth.model';

export interface UserPermissionAssignment {
  id: string;
  userId: string;
  featureCode: string;
  permissionCode: string;
}

@Injectable({ providedIn: 'root' })
export class AccessControlApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/v1';

  getUsers(): Observable<AuthUser[]> {
    return this.http.get<ApiResponse<AuthUser[]>>(`${this.API_URL}/users`).pipe(map(response => response.data || []));
  }

  getPermissions(userId: string): Observable<UserPermissionAssignment[]> {
    return this.http.get<ApiResponse<UserPermissionAssignment[]>>(`${this.API_URL}/users/${userId}/permission-assignments`).pipe(map(response => response.data || []));
  }

  assignPermission(userId: string, featureCode: string, permissionCode: string): Observable<UserPermissionAssignment> {
    return this.http.post<ApiResponse<UserPermissionAssignment>>(`${this.API_URL}/users/${userId}/permission-assignments`, { featureCode, permissionCode }).pipe(map(response => response.data));
  }

  clearPermissions(userId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/users/${userId}/permission-assignments`).pipe(map(() => void 0));
  }
}