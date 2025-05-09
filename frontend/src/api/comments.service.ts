import api from "./api";
import type { Comment } from "../types/index";

export const CommentsService = {
  // Get all comments for a post
  getPostComments: async (postId: string): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/comments/post/${postId}`);
    return response;
  },

  // Create a new comment on a post
  createComment: async (postId: string, content: string): Promise<Comment> => {
    const response = await api.post<Comment>(`/comments/post/${postId}`, {
      content,
    });
    return response;
  },

  // Update a comment
  updateComment: async (id: string, content: string): Promise<Comment> => {
    const response = await api.put<Comment>(`/comments/${id}`, { content });
    return response;
  },

  // Delete a comment
  deleteComment: async (id: string): Promise<void> => {
    await api.delete<void>(`/comments/${id}`);
  },
};
