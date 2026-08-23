import { apiClient, ApiResponse } from './api';

export interface CreateConversationPayload {
  projectId: string;
  otherUserId: string;
}

export const chatService = {
  getConversations: async (): Promise<ApiResponse> => {
    return await apiClient('/conversations');
  },

  createConversation: async (payload: CreateConversationPayload): Promise<ApiResponse> => {
    return await apiClient('/conversations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMessages: async (conversationId: string): Promise<ApiResponse> => {
    return await apiClient(`/conversations/${conversationId}/messages`);
  },

  sendMessage: async (conversationId: string, content: string): Promise<ApiResponse> => {
    return await apiClient(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};
