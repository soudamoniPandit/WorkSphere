import { apiClient, ApiResponse } from './api';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: 'CLIENT' | 'FREELANCER';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<ApiResponse> => {
    const res = await apiClient<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res;
  },

  login: async (payload: LoginPayload): Promise<ApiResponse> => {
    const res = await apiClient<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res;
  },

  getMe: async (): Promise<ApiResponse> => {
    return await apiClient('/auth/me');
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
};
