const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  pagination?: any;
  message?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Request failed with status ${response.status}`);
    }

    return result;
  } catch (error: any) {
    console.error(`[API Client Error] ${endpoint}:`, error.message);
    return {
      success: false,
      message: error.message || 'Network communication error',
    };
  }
}

export const apiService = {
  checkHealth: () => apiClient<{ status: string; message: string; timestamp: string }>('/health'),
};
