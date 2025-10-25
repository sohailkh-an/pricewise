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

  // Get product recommendations
  getRecommendations: async (id, limit = 8) => {
    const response = await api.get(`/api/products/${id}/recommendations`, {
      params: { limit }
    });
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
  },

  // Search products with advanced filtering
  search: async (params = {}) => {
    const response = await api.get('/api/products/search', { params });
    return response.data;
  }
};

// Wishlist API
export const wishlistAPI = {
  // Get user's wishlist
  getAll: async () => {
    const response = await api.get('/api/wishlist');
    return response.data;
  },

  // Add product to wishlist
  add: async (productId) => {
    const response = await api.post('/api/wishlist', { productId });
    return response.data;
  },

  // Remove product from wishlist
  remove: async (productId) => {
    const response = await api.delete(`/api/wishlist/${productId}`);
    return response.data;
  },

  // Check if product is in wishlist
  check: async (productId) => {
    const response = await api.get(`/api/wishlist/check/${productId}`);
    return response.data;
  },

  // Clear entire wishlist
  clear: async () => {
    const response = await api.delete('/api/wishlist');
    return response.data;
  }
};

export default api;
