/**
 * API Service - Connects to PHP backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/backend';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Set auth token
const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove auth token
const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// API request helper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Auth endpoints
  auth: {
    signup: async (email: string, password: string) => {
      const data = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) {
        setAuthToken(data.token);
      }
      return data;
    },

    login: async (email: string, password: string) => {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) {
        setAuthToken(data.token);
      }
      return data;
    },

    logout: async () => {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      removeAuthToken();
    },

    getCurrentUser: async () => {
      return apiRequest('/api/auth/me');
    },
  },

  // Messages endpoints
  messages: {
    getAll: async () => {
      return apiRequest('/api/messages');
    },

    add: async (message: any) => {
      return apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify(message),
      });
    },

    toggleFavorite: async (id: string) => {
      return apiRequest(`/api/messages/${id}/favorite`, {
        method: 'PUT',
      });
    },

    delete: async (id: string) => {
      return apiRequest(`/api/messages/${id}`, {
        method: 'DELETE',
      });
    },

    getFavorites: async () => {
      return apiRequest('/api/messages/favorites');
    },

    search: async (query: string) => {
      return apiRequest(`/api/messages/search?q=${encodeURIComponent(query)}`);
    },
  },
};

export { getAuthToken, setAuthToken, removeAuthToken };
