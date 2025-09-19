// Force the correct API URL for now
const API_BASE_URL = 'http://localhost:5000/api';

console.log('API Service: Environment API URL:', process.env.REACT_APP_API_URL);
console.log('API Service: Forced API Base URL:', API_BASE_URL);

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('API Service: Constructor - baseURL set to:', this.baseURL);
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Get headers for requests
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      console.log('API: Getting auth token:', token ? 'Token exists' : 'No token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('API: Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
      } else {
        console.log('API: No token available, request will be unauthenticated');
      }
    }

    console.log('API: Final headers:', headers);
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    // Add cache-busting parameter to prevent browser cache issues
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${this.baseURL}${endpoint}${separator}_t=${Date.now()}`;
    console.log('API: Base URL:', this.baseURL);
    console.log('API: Endpoint:', endpoint);
    console.log('API: Final URL:', url);
    console.log('API: this.baseURL type:', typeof this.baseURL);
    console.log('API: this.baseURL value:', JSON.stringify(this.baseURL));
    console.log('API Request Method:', options.method || 'GET');
    console.log('API Request Headers:', this.getHeaders(options.includeAuth !== false));
    
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      console.log('API: Making request to:', url);
      console.log('API: Full URL being called:', url);
      console.log('API: Config being used:', config);
      const response = await fetch(url, config);
      console.log('API: Response status:', response.status);
      console.log('API: Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Handle different response statuses
      if (response.status === 401) {
        console.log('API: Unauthorized - clearing token and redirecting to login');
        // Unauthorized - clear token and redirect to login
        this.setAuthToken(null);
        window.location.href = '/login';
        throw new Error('Unauthorized access');
      }

      if (response.status === 403) {
        console.log('API: Access forbidden');
        throw new Error('Access forbidden');
      }

      if (response.status === 404) {
        console.log('API: Resource not found - endpoint may not exist');
        throw new Error('Resource not found');
      }

      if (response.status >= 500) {
        console.log('API: Server error occurred');
        throw new Error('Server error occurred');
      }

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      console.log('API: Response content type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('API: Response data:', data);
      } else {
        data = await response.text();
        console.log('API: Response text:', data);
      }

      if (!response.ok) {
        console.log('API: Response not OK, throwing error');
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('API: Request successful');
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      console.error('API error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PATCH request
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  // Upload file
  async upload(endpoint, formData, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
        // Don't set Content-Type for FormData
      },
      body: formData,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Create and export a single instance
const apiService = new ApiService();
console.log('API Service: Instance created with baseURL:', apiService.baseURL);
export default apiService;
