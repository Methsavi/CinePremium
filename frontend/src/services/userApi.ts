import axios from 'axios';
import { ApiResponse, User } from '../types/auth';

const BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
const USERS_API = `${BASE_URL}/api/v1/users`;

/**
 * Fetch all registered users from the backend API endpoint (/api/v1/users).
 * Optionally accepts a JWT token for Authorization headers.
 */
export async function getRegisteredUsers(token?: string | null): Promise<User[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await axios.get<ApiResponse<User[]>>(USERS_API, { headers });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      'Failed to fetch registered users'
    );
  }
}

export async function deleteUser(id: string, token?: string | null): Promise<void> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    await axios.delete(`${USERS_API}/${id}`, { headers });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to delete user'
    );
  }
}

export async function updateUser(id: string, updateData: Partial<User>, token?: string | null): Promise<User> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await axios.put<ApiResponse<User>>(`${USERS_API}/${id}`, updateData, { headers });
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to update user'
    );
  }
}

export const userApi = {
  getRegisteredUsers,
  deleteUser,
  updateUser,
};
