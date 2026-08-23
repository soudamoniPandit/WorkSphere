import { apiClient, ApiResponse } from './api';

export interface CreateProjectPayload {
  title: string;
  description: string;
  budget: number;
  deadline?: string;
  skills: string[];
}

export interface UpdateProjectPayload {
  title?: string;
  description?: string;
  budget?: number;
  deadline?: string;
  status?: string;
  skills?: string[];
}

export interface GetProjectsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  skill?: string;
  search?: string;
  minBudget?: number;
  maxBudget?: number;
}

export const projectService = {
  createProject: async (payload: CreateProjectPayload): Promise<ApiResponse> => {
    return await apiClient('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getProjects: async (params?: GetProjectsQueryParams): Promise<ApiResponse> => {
    const urlParams = new URLSearchParams();
    if (params?.page) urlParams.append('page', params.page.toString());
    if (params?.limit) urlParams.append('limit', params.limit.toString());
    if (params?.status) urlParams.append('status', params.status);
    if (params?.skill) urlParams.append('skill', params.skill);
    if (params?.search) urlParams.append('search', params.search);
    if (params?.minBudget) urlParams.append('minBudget', params.minBudget.toString());
    if (params?.maxBudget) urlParams.append('maxBudget', params.maxBudget.toString());

    const queryString = urlParams.toString() ? `?${urlParams.toString()}` : '';
    return await apiClient(`/projects${queryString}`);
  },

  getProjectById: async (id: string): Promise<ApiResponse> => {
    return await apiClient(`/projects/${id}`);
  },

  updateProject: async (id: string, payload: UpdateProjectPayload): Promise<ApiResponse> => {
    return await apiClient(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteProject: async (id: string): Promise<ApiResponse> => {
    return await apiClient(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  getMyProjects: async (): Promise<ApiResponse> => {
    return await apiClient('/projects/mine');
  },

  getDashboardStats: async (): Promise<ApiResponse> => {
    return await apiClient('/dashboard/stats');
  },
};

