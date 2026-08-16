import axios from 'axios';
import { ApiResponse, AuthResponseData, LoginPayload, RegisterPayload, User } from '../types/auth';

const BASE_URL = import.meta.env.BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000';
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
