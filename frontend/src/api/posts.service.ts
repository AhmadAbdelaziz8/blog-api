import api from "./api";
import { Post } from "../types";

export const PostsService = {
  // Get all published posts
  getAllPosts: async (): Promise<Post[]> => {
    const response = await api.get<Post[]>("/posts");
    return response.data;
  },

  // Get a single post by id
  getPostById: async (id: string): Promise<Post> => {
    const response = await api.get<Post>(`/posts/${id}`);
    return response.data;
  },

  // Get all posts for the author dashboard (including unpublished)
  getAuthorPosts: async (): Promise<Post[]> => {
    const response = await api.get<Post[]>("/posts/author/dashboard");
    return response.data;
  },

  // Create a new post
  createPost: async (postData: {
    title: string;
    content: string;
    published: boolean;
  }): Promise<Post> => {
    const response = await api.post<Post>("/posts", postData);
    return response.data;
  },

  // Update an existing post
  updatePost: async (
    id: string,
    postData: { title: string; content: string; published: boolean }
  ): Promise<Post> => {
    const response = await api.put<Post>(`/posts/${id}`, postData);
    return response.data;
  },

  // Delete a post
  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  // Toggle post publish status
  togglePublishStatus: async (id: string): Promise<Post> => {
    const response = await api.patch<Post>(`/posts/${id}/publish`);
    return response.data;
  },
};
