export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | string;
  createdAt?: string;
  avatarUrl?: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}
