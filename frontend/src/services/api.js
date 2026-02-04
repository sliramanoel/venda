import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Don't redirect automatically, let components handle it
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await axios.post(`${API}/auth/register`, { name, email, password });
    return response.data;
  },
  verify: async () => {
    const response = await apiClient.post('/auth/verify');
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
  getUser: () => {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }
};

// Settings API
export const settingsApi = {
  get: async () => {
    const response = await axios.get(`${API}/settings`);
    return response.data;
  },
  update: async (data) => {
    const response = await apiClient.put('/settings', data);
    return response.data;
  }
};

// Images API
export const imagesApi = {
  get: async () => {
    const response = await axios.get(`${API}/images`);
    return response.data;
  },
  update: async (data) => {
    const response = await apiClient.put('/images', data);
    return response.data;
  }
};

// Orders API
export const ordersApi = {
  create: async (orderData) => {
    const response = await axios.post(`${API}/orders`, orderData);
    return response.data;
  },
  list: async () => {
    const response = await axios.get(`${API}/orders`);
    return response.data;
  },
  get: async (orderId) => {
    const response = await axios.get(`${API}/orders/${orderId}`);
    return response.data;
  },
  updateStatus: async (orderId, status) => {
    const response = await axios.patch(`${API}/orders/${orderId}/status`, { status });
    return response.data;
  },
  validate: async (data) => {
    const response = await axios.post(`${API}/orders/validate`, data);
    return response.data;
  }
};

// Payments API (OrionPay)
export const paymentsApi = {
  generatePix: async (orderId) => {
    const response = await axios.post(`${API}/payments/pix/generate?order_id=${orderId}`);
    return response.data;
  },
  checkStatus: async (orderId) => {
    const response = await axios.get(`${API}/payments/pix/status/${orderId}`);
    return response.data;
  },
  simulatePayment: async (orderId) => {
    const response = await apiClient.post(`/webhooks/orionpay/simulate-payment?order_id=${orderId}`);
    return response.data;
  }
};

// Uploads API
export const uploadsApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  listImages: async () => {
    const response = await apiClient.get('/uploads/list');
    return response.data;
  },
  deleteImage: async (filename) => {
    const response = await apiClient.delete(`/uploads/images/${filename}`);
    return response.data;
  }
};

// Analytics API
export const analyticsApi = {
  // Tracking
  trackPageview: async (data) => {
    try {
      await axios.post(`${API}/analytics/track/pageview`, data);
    } catch (e) {
      console.warn('Analytics tracking failed:', e);
    }
  },
  trackAction: async (action, page, metadata = {}) => {
    try {
      await axios.post(`${API}/analytics/track/action`, { action, page, metadata });
    } catch (e) {
      console.warn('Analytics tracking failed:', e);
    }
  },
  
  // Stats (authenticated)
  getOverview: async (period = '7d', startDate = null, endDate = null) => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await apiClient.get(`/analytics/stats/overview?${params}`);
    return response.data;
  },
  getPageviews: async (period = '7d', startDate = null, endDate = null) => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await apiClient.get(`/analytics/stats/pageviews?${params}`);
    return response.data;
  },
  getTimeline: async (period = '7d', granularity = 'day', startDate = null, endDate = null) => {
    const params = new URLSearchParams({ period, granularity });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await apiClient.get(`/analytics/stats/timeline?${params}`);
    return response.data;
  },
  getDevices: async (period = '7d', startDate = null, endDate = null) => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await apiClient.get(`/analytics/stats/devices?${params}`);
    return response.data;
  },
  getTrafficSources: async (period = '7d', startDate = null, endDate = null) => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await apiClient.get(`/analytics/stats/traffic-sources?${params}`);
    return response.data;
  },
  getRealtime: async () => {
    const response = await apiClient.get('/analytics/stats/realtime');
    return response.data;
  },
  getActions: async (period = '7d', startDate = null, endDate = null) => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await apiClient.get(`/analytics/stats/actions?${params}`);
    return response.data;
  }
};

export default { settingsApi, imagesApi, ordersApi, paymentsApi, uploadsApi, authApi, analyticsApi };
