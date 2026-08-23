import { apiClient, ApiResponse } from './api';

export interface ListFreelancersParams {
  search?: string;
  skill?: string;
}

export interface UpdateFreelancerPayload {
  fullName?: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  hourlyRate?: number;
  location?: string;
  experienceYears?: number;
  skills?: string[];
}

export interface UpdateClientPayload {
  fullName?: string;
  avatarUrl?: string;
  companyName?: string;
  companyWebsite?: string;
  description?: string;
  location?: string;
}

export interface PortfolioItemPayload {
  title: string;
  description: string;
  projectUrl?: string;
  imageUrl?: string;
}

export const profileService = {
  listFreelancers: async (params?: ListFreelancersParams): Promise<ApiResponse> => {
    const urlParams = new URLSearchParams();
    if (params?.search) urlParams.append('search', params.search);
    if (params?.skill) urlParams.append('skill', params.skill);

    const queryString = urlParams.toString() ? `?${urlParams.toString()}` : '';
    return await apiClient(`/profiles/freelancers${queryString}`);
  },

  getMyProfile: async (): Promise<ApiResponse> => {
    return await apiClient('/profiles/me');
  },

  updateFreelancerProfile: async (payload: UpdateFreelancerPayload): Promise<ApiResponse> => {
    return await apiClient('/profiles/freelancer', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  updateClientProfile: async (payload: UpdateClientPayload): Promise<ApiResponse> => {
    return await apiClient('/profiles/client', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  addPortfolioItem: async (payload: PortfolioItemPayload): Promise<ApiResponse> => {
    return await apiClient('/profiles/freelancer/portfolio', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deletePortfolioItem: async (itemId: string): Promise<ApiResponse> => {
    return await apiClient(`/profiles/freelancer/portfolio/${itemId}`, {
      method: 'DELETE',
    });
  },
};
