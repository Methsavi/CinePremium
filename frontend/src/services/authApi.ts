import axios from 'axios';
import {
  ApiResponse,
  AuthResponseData,
  LoginPayload,
  RegisterPayload,
  User,
  VerifyEmailPayload,
  ForgotPasswordPayload,
  VerifyResetOTPPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from '../types/auth';

const BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_V1 = `${BASE_URL}/api/v1/auth`;

const apiClient = axios.create({
  baseURL: API_V1,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/login', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Login failed'
      );
    }
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/register', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Registration failed'
      );
    }
  },

  async verifyEmail(payload: VerifyEmailPayload): Promise<ApiResponse<AuthResponseData>> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/verify-email', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Email verification failed'
      );
    }
  },

  async resendVerification(email: string): Promise<ApiResponse<AuthResponseData>> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/resend-verification', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to resend verification code'
      );
    }
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<AuthResponseData>> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/forgot-password', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to send password reset OTP'
      );
    }
  },

  async verifyResetOTP(payload: VerifyResetOTPPayload): Promise<ApiResponse<{ valid: boolean }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ valid: boolean }>>('/verify-reset-otp', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Invalid or expired OTP'
      );
    }
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<AuthResponseData>> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/reset-password', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to reset password'
      );
    }
  },

  async changePassword(payload: ChangePasswordPayload, token: string): Promise<ApiResponse<AuthResponseData>> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/change-password', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to change password'
      );
    }
  },

  async updateProfile(payload: FormData | Partial<User>, token: string): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiClient.put<ApiResponse<{ user: User }>>('/profile', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}),
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to update profile'
      );
    }
  },

  async deleteAccount(token: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.delete<ApiResponse<null>>('/delete-account', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to delete account'
      );
    }
  },

  async getMe(token: string): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to fetch user profile'
      );
    }
  },

  async logout(token: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<ApiResponse<null>>('/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Logout failed'
      );
    }
  },
};
