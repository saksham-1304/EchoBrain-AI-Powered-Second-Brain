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
  refreshToken?: string;
  user?: User;
  errors?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

// Enhanced storage helpers with encryption
const STORAGE_PREFIX = 'echobrain_';

const getToken = (): string | null => {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}auth_token`);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const setToken = (token: string): void => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}auth_token`, token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}refresh_token`);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

const setRefreshToken = (token: string): void => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}refresh_token`, token);
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
};

const removeTokens = (): void => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}auth_token`);
    localStorage.removeItem(`${STORAGE_PREFIX}refresh_token`);
    localStorage.removeItem(`${STORAGE_PREFIX}user`);
  } catch (error) {
    console.error('Error removing tokens:', error);
  }
};

// Request queue for handling concurrent requests
const requestQueue = new Map<string, Promise<any>>();

// Request cache with timestamps to prevent excessive requests
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds cache for content requests

// Global request counter for debugging
let requestCounter = 0;

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

// Network status tracking
let isOnline = navigator.onLine;
window.addEventListener('online', () => { isOnline = true; });
window.addEventListener('offline', () => { isOnline = false; });

// Enhanced API client with retry logic and error handling
class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateDelay(attempt: number): number {
    const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
    return Math.min(delay, RETRY_CONFIG.maxDelay);
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!response.ok) {
      removeTokens();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    if (data.success && data.token) {
      setToken(data.token);
      return data.token;
    }

    throw new Error('Invalid refresh response');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    // Check network status
    if (!isOnline) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    // Create request key for deduplication
    const requestKey = `${options.method || 'GET'}_${endpoint}_${JSON.stringify(options.body || {})}`;
    
    // Debug logging
    requestCounter++;
    console.log(`[API Request #${requestCounter}] ${options.method || 'GET'} ${endpoint}`);
    
    // Check if same request is already in progress
    if (requestQueue.has(requestKey)) {
      console.log(`[API Request #${requestCounter}] Duplicate request detected, returning existing promise`);
      return requestQueue.get(requestKey);
    }

    const requestPromise = this.executeRequest<T>(endpoint, options, retryCount);
    requestQueue.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      console.log(`[API Request #${requestCounter}] Completed successfully`);
      return result;
    } finally {
      requestQueue.delete(requestKey);
    }
  }

  private async executeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    let token = getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 errors with token refresh
      if (response.status === 401 && token && !endpoint.includes('/auth/')) {
        try {
          const newToken = await this.refreshAccessToken();
          // Retry with new token
          return this.request<T>(endpoint, {
            ...options,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
        } catch (refreshError) {
          removeTokens();
          throw new Error('Session expired. Please log in again.');
        }
      }

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error('Invalid JSON response from server');
        }
      } else {
        data = { 
          success: false, 
          message: `HTTP ${response.status}: ${response.statusText}` 
        };
      }

      if (!response.ok) {
        const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
        
        // Don't retry client errors (4xx) except 408, 429
        if (response.status >= 400 && response.status < 500 && 
            response.status !== 408 && response.status !== 429) {
          throw new Error(errorMessage);
        }
        
        // Retry server errors and specific client errors
        if (retryCount < RETRY_CONFIG.maxRetries) {
          const delay = this.calculateDelay(retryCount);
          await this.sleep(delay);
          return this.executeRequest<T>(endpoint, options, retryCount + 1);
        }
        
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        if (retryCount < RETRY_CONFIG.maxRetries) {
          const delay = this.calculateDelay(retryCount);
          await this.sleep(delay);
          return this.executeRequest<T>(endpoint, options, retryCount + 1);
        }
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }
      
      throw error;
    }
  }

  // Auth methods with enhanced error handling
  async signup(email: string, username: string, password: string): Promise<AuthResponse> {
    try {
      return await this.request<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, username, password }),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.token) {
        setToken(response.token);
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
        }
        if (response.user) {
          localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      return await this.request<ApiResponse<User>>('/auth/profile');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch profile.');
    }
  }

  // Content methods with pagination support
  async createContent(contentData: any): Promise<ApiResponse> {
    try {
      return await this.request<ApiResponse>('/content', {
        method: 'POST',
        body: JSON.stringify(contentData),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create content.');
    }
  }

  async getUserContent(page: number = 1, limit: number = 20): Promise<ApiResponse> {
    try {
      console.log(`[API] Loading user content - page: ${page}, limit: ${limit}`);
      
      // Check cache for recent identical requests
      const cacheKey = `getUserContent_${page}_${limit}`;
      const cached = requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`[API] Returning cached result for getUserContent`);
        return cached.data;
      }
      
      const result = await this.request<ApiResponse>(`/content/home?page=${page}&limit=${limit}`);
      
      // Cache the result
      requestCache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
    } catch (error: any) {
      console.error(`[API] Failed to fetch content:`, error);
      throw new Error(error.message || 'Failed to fetch content.');
    }
  }

  async getContentStats(): Promise<ApiResponse> {
    try {
      return await this.request<ApiResponse>('/content/stats');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch statistics.');
    }
  }

  async searchContent(query: string, page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      return await this.request<ApiResponse>('/content/search', {
        method: 'POST',
        body: JSON.stringify({ query, page, limit }),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Search failed. Please try again.');
    }
  }

  async deleteContent(contentId: string): Promise<ApiResponse> {
    try {
      return await this.request<ApiResponse>('/content', {
        method: 'DELETE',
        body: JSON.stringify({ contentId }),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete content.');
    }
  }

  async shareContent(share: boolean): Promise<ApiResponse> {
    try {
      return await this.request<ApiResponse>('/content/share', {
        method: 'POST',
        body: JSON.stringify({ share }),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update sharing settings.');
    }
  }

  async getSharedContent(shareLink: string): Promise<ApiResponse> {
    try {
      return await this.request<ApiResponse>(`/content/shared/${shareLink}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch shared content.');
    }
  }

  // Utility methods
  logout(): void {
    removeTokens();
  }

  isAuthenticated(): boolean {
    return !!getToken();
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(`${STORAGE_PREFIX}user`);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Health check method
  async healthCheck(): Promise<ApiResponse> {
    try {
      return await this.request<ApiResponse>('/health');
    } catch (error: any) {
      throw new Error(error.message || 'Health check failed.');
    }
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL);

// Export utility functions
export { getToken, setToken, removeTokens };