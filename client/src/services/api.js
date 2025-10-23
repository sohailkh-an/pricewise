import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Products API
export const productsAPI = {
  // Get all products with optional filters
  getAll: async (params = {}) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  getByCategory: async (category, params = {}) => {
    const response = await api.get('/api/products', { 
      params: { category, ...params } 
    });
    return response.data;
  },

  // Get single product by ID
  getById: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // Get price comparison data
  getPriceComparison: async (url) => {
    const response = await api.get('/api/products/price', { 
      params: { url } 
    });
    return response.data;
  },

  // Create product (admin only)
  create: async (productData, userEmail) => {
    const response = await api.post('/api/products', productData, {
      headers: { 'user-email': userEmail }
    });
    return response.data;
  },

  // Update product (admin only)
  update: async (id, productData, userEmail) => {
    const response = await api.put(`/api/products/${id}`, productData, {
      headers: { 'user-email': userEmail }
    });
    return response.data;
  },

  // Delete product (admin only)
  delete: async (id, userEmail) => {
    const response = await api.delete(`/api/products/${id}`, {
      headers: { 'user-email': userEmail }
    });
    return response.data;
  }
};

export default api;
