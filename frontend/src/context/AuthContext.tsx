import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginPayload, RegisterPayload } from '../types/auth';
import { authApi } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'savi_auth_token';
const USER_KEY = 'savi_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Validate existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        try {
          const res = await authApi.getMe(storedToken);
          if (res.data?.user) {
            setUser(res.data.user);
            setToken(storedToken);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
          } else {
            // Token expired or invalid
            handleSessionClear();
          }
        } catch (err: any) {
          console.warn('Session verification failed:', err?.message);
          // If offline or dev fallback, keep cached user if present
          if (!user) {
            handleSessionClear();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const handleSessionClear = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const login = async (credentials: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.login(credentials);
      const { user: authUser, token: authToken } = res.data;
      
      setUser(authUser);
      setToken(authToken);
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.register(payload);
      const { user: authUser, token: authToken } = res.data;

      setUser(authUser);
      setToken(authToken);
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    if (token) {
      try {
        await authApi.logout(token);
      } catch (err) {
        console.warn('Logout endpoint call failed:', err);
      }
    }
    handleSessionClear();
    setIsLoading(false);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
