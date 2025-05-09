import type { ApiOptions, HttpMethod } from "../types";

const API_URL = "http://localhost:4000/api";

// Helper function to handle API requests using the Fetch API
const apiRequest = async <T>(
  endpoint: string,
  method: HttpMethod = "GET",
  data?: any,
  customHeaders: Record<string, string> = {}
): Promise<T> => {
  // Prepare request URL
  const url = `${API_URL}${endpoint}`;

  // Get token from localStorage for authentication
  const token = localStorage.getItem("token");

  // Prepare headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  // Add authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Prepare request options
  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  // Add body for non-GET requests if data is provided
  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  try {
    // Make the request
    const response = await fetch(url, options);

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message || `Request failed with status ${response.status}`
      );
      (error as any).response = {
        status: response.status,
        data: errorData,
      };
      throw error;
    }

    // Parse JSON response if not a DELETE request (which may return empty body)
    if (method === "DELETE") {
      return {} as T;
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    // Check if it's a network error (like connection refused)
    if (error.message === "Failed to fetch") {
      console.error("Server connection error:", error);
      throw new Error(
        "Unable to connect to the server. Please check if the backend server is running."
      );
    }
    // Otherwise rethrow the original error
    throw error;
  }
};

// API utility methods for different HTTP methods
const api = {
  get: <T>(endpoint: string, options: ApiOptions = {}) =>
    apiRequest<T>(endpoint, "GET", null, options.headers),

  post: <T>(endpoint: string, data: any, options: ApiOptions = {}) =>
    apiRequest<T>(endpoint, "POST", data, options.headers),

  put: <T>(endpoint: string, data: any, options: ApiOptions = {}) =>
    apiRequest<T>(endpoint, "PUT", data, options.headers),

  patch: <T>(endpoint: string, data: any, options: ApiOptions = {}) =>
    apiRequest<T>(endpoint, "PATCH", data, options.headers),

  delete: <T>(endpoint: string, options?: ApiOptions) =>
    apiRequest<T>(endpoint, "DELETE", null, options?.headers),
};

export default api;
