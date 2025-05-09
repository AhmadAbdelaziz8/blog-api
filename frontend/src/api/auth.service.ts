import api from "./api";
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from "../types";

export const AuthService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    // Store the token in localStorage
    localStorage.setItem("token", response.token);
    // Store user info
    localStorage.setItem("user", JSON.stringify(response.user));
    return response;
  },

  // Register user
  register: async (userData: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    // Store the token in localStorage
    localStorage.setItem("token", response.token);
    // Store user info
    localStorage.setItem("user", JSON.stringify(response.user));
    return response;
  },

  // Logout user
  logout: (): void => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    // Remove user info
    localStorage.removeItem("user");
  },

  // Check if user is logged in
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem("token");
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
};
