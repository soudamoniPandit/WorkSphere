import { apiClient, ApiResponse } from './api';

export interface CreateReviewPayload {
  projectId: string;
  rating: number; // 1 to 5
  comment: string;
}

export const reviewService = {
  createReview: async (payload: CreateReviewPayload): Promise<ApiResponse> => {
    return await apiClient('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getProjectReviews: async (projectId: string): Promise<ApiResponse> => {
    return await apiClient(`/reviews?projectId=${encodeURIComponent(projectId)}`);
  },
};
