export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cinema_manager' | 'user' | string;
  isVerified?: boolean;
  createdAt?: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
}

export interface AuthResponseData {
  user: User;
  token?: string;
  verificationCode?: string;
  otp?: string;
  message?: string;
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

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetOTPPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}
