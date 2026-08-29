import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/auth.model';

export interface UserFeature {
  id: string;
  code: string;
  title: string;
  path: string;
  icon: string;
  category: string;
  orderIndex: number;
  badge?: number;
  enabled: boolean;
  permissions: string[];
  children?: UserFeature[];
}

interface UserFeaturesResponse {
  features: UserFeature[];
}

@Injectable({ providedIn: 'root' })
export class MenuApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://hrms-backend-her1.onrender.com/api/v1';

  getCurrentUserFeatures(): Observable<UserFeature[]> {
    return this.http.get<ApiResponse<UserFeaturesResponse>>(`${this.API_URL}/users/me/features`).pipe(
      map(response => response.data?.features || [])
    );
  }

  getUserAssignments(userId: string): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.API_URL}/users/${userId}/menu-assignments`).pipe(
      map(response => response.data || [])
    );
  }

  assignMenu(userId: string, featureCode: string): Observable<string[]> {
    return this.http.post<ApiResponse<string[]>>(`${this.API_URL}/users/${userId}/menu-assignments`, { featureCode }).pipe(
      map(response => response.data || [])
    );
  }

  removeMenu(userId: string, featureCode: string): Observable<string[]> {
    return this.http.delete<ApiResponse<string[]>>(`${this.API_URL}/users/${userId}/menu-assignments/${featureCode}`).pipe(
      map(response => response.data || [])
    );
  }
}