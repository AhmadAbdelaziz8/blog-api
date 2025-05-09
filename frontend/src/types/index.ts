// User Roles
export enum Role {
  USER = "USER",
  AUTHOR = "AUTHOR",
  ADMIN = "ADMIN",
}

// User Interface
export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// Post Interface
export interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
  author?: User;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
  };
}

// Comment Interface
export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  post?: Post;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

// Auth Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  role?: Role;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// API Interfaces
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiOptions {
  headers?: Record<string, string>;
}
