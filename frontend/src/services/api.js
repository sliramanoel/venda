import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Settings API
export const settingsApi = {
  get: async () => {
    const response = await axios.get(`${API}/settings`);
    return response.data;
  },
  update: async (data) => {
    const response = await axios.put(`${API}/settings`, data);
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
    const response = await axios.put(`${API}/images`, data);
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
  }
};

export default { settingsApi, imagesApi, ordersApi };
