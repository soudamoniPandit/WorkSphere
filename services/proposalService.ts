import { apiClient, ApiResponse } from './api';

export interface SubmitProposalPayload {
  coverLetter: string;
  proposedPrice: number;
  estimatedDays: number;
}

export type ProposalStatus = 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED';

export const proposalService = {
  submitProposal: async (projectId: string, payload: SubmitProposalPayload): Promise<ApiResponse> => {
    return await apiClient(`/projects/${projectId}/proposals`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getProjectProposals: async (projectId: string): Promise<ApiResponse> => {
    return await apiClient(`/projects/${projectId}/proposals`);
  },

  getMyProposals: async (): Promise<ApiResponse> => {
    return await apiClient('/proposals/mine');
  },

  getProposalById: async (id: string): Promise<ApiResponse> => {
    return await apiClient(`/proposals/${id}`);
  },

  updateProposalStatus: async (id: string, status: ProposalStatus): Promise<ApiResponse> => {
    return await apiClient(`/proposals/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};
