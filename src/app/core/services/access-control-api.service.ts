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

export interface Definition { id: string; code: string; name: string; description?: string; }

@Injectable({ providedIn: 'root' })
export class AccessControlApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://hrms-backend-her1.onrender.com/api/v1';

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

  getRoles(): Observable<Definition[]> {
    return this.http.get<ApiResponse<Definition[]>>(`${this.API_URL}/users/access-control/roles`).pipe(map(response => response.data || []));
  }

  createRole(code: string, name: string, description: string): Observable<Definition> {
    return this.http.post<ApiResponse<Definition>>(`${this.API_URL}/users/access-control/roles`, { code, name, description }).pipe(map(response => response.data));
  }

  getPermissionDefinitions(): Observable<Definition[]> {
    return this.http.get<ApiResponse<Definition[]>>(`${this.API_URL}/users/access-control/permissions`).pipe(map(response => response.data || []));
  }

  createPermission(code: string, name: string, description: string): Observable<Definition> {
    return this.http.post<ApiResponse<Definition>>(`${this.API_URL}/users/access-control/permissions`, { code, name, description }).pipe(map(response => response.data));
  }
}