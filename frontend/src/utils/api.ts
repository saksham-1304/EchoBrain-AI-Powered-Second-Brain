const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  errors?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

// Storage helpers
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

const removeToken = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

// API client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // If JSON parsing fails, create a generic error response
        data = { 
          success: false, 
          message: `HTTP ${response.status}: ${response.statusText}` 
        };
      }

      if (!response.ok) {
        // If we have an error response with a message, use it
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', {
        url,
        error: error.message,
        endpoint
      });
      
      // Re-throw with more context if it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }
      
      throw error;
    }
  }

  // Auth methods
  async signup(email: string, username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      setToken(response.token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }

    return response;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/auth/profile');
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Content methods
  async createContent(contentData: any): Promise<ApiResponse> {
    return this.request<ApiResponse>('/content', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  }

  async getUserContent(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/content/home');
  }

  async getContentStats(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/content/stats');
  }

  async searchContent(query: string): Promise<ApiResponse> {
    return this.request<ApiResponse>('/content/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async deleteContent(contentId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>('/content', {
      method: 'DELETE',
      body: JSON.stringify({ contentId }),
    });
  }

  async shareContent(share: boolean): Promise<ApiResponse> {
    return this.request<ApiResponse>('/content/share', {
      method: 'POST',
      body: JSON.stringify({ share }),
    });
  }

  async getSharedContent(shareLink: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/content/shared/${shareLink}`);
  }

  // Utility methods
  logout(): void {
    removeToken();
  }

  isAuthenticated(): boolean {
    return !!getToken();
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL);

// Export utility functions
export { getToken, setToken, removeToken };