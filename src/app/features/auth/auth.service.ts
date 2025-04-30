import { Injectable } from '@angular/core';
import { ApiResponse, ApiResult } from 'src/app/core/constants/api.response';
import { API_URL } from 'src/app/core/constants/apiurls';
import { ApiService } from 'src/app/core/services/api.service';
import {
  AccessTokens,
  Signup,
  ValidataEmailOTP,
} from 'src/app/features/auth/auth.model';
import { RequestLoginOtp, Signin } from './auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private api: ApiService) {}

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  getAccessTokens(): AccessTokens {
    const authToken = this.getAuthToken();
    const refreshToken = this.getRefreshToken();
    return { authToken, refreshToken };
  }

  setAccessTokens(data: AccessTokens): void {
    const { authToken, refreshToken } = data;
    if (authToken) localStorage.setItem('authToken', authToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  }

  removeAccessTokens(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  logout(): void {
    this.removeAccessTokens();
  }

  sendEmailOTP(data: { email: string }): ApiResult {
    return this.api.post<ApiResponse<ApiResult>>(
      API_URL.AUTH.SEND_EMAIL_OTP,
      data,
    );
  }

  verifyEmailOTP(data: ValidataEmailOTP): ApiResult {
    return this.api.post<ApiResponse<ApiResult>>(
      API_URL.AUTH.VALIDATE_EMAIL_OTP,
      data,
    );
  }

  signup(data: Signup): ApiResult {
    return this.api.post<ApiResponse<ApiResult>>(API_URL.AUTH.SIGNUP, data);
  }

  requestLoginOTP(data: RequestLoginOtp): ApiResult {
    return this.api.post<ApiResponse<ApiResult>>(
      API_URL.AUTH.REQUEST_LOGIN_OTP,
      data,
    );
  }

  signin(data: Signin): ApiResult {
    return this.api.post<ApiResponse<ApiResult>>(API_URL.AUTH.LOGIN, data);
  }
}
