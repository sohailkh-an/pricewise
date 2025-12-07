import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ||  {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {
    //ignored
  }
  return config;
});

export const productsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/api/products", { params });
    return response.data;
  },

  getByCategory: async (category, params = {}) => {
    const response = await api.get("/api/products", {
      params: { category, ...params },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  getRecommendations: async (id, limit = 8) => {
    const response = await api.get(`/api/products/${id}/recommendations`, {
      params: { limit },
    });
    return response.data;
  },

  getPriceComparison: async (url) => {
    const response = await api.get("/api/products/price", {
      params: { url },
    });
    return response.data;
  },

  create: async (productData, userEmail) => {
    const response = await api.post("/api/products", productData, {
      headers: { "user-email": userEmail },
    });
    return response.data;
  },

  update: async (id, productData, userEmail) => {
    const response = await api.put(`/api/products/${id}`, productData, {
      headers: { "user-email": userEmail },
    });
    return response.data;
  },

  delete: async (id, userEmail) => {
    const response = await api.delete(`/api/products/${id}`, {
      headers: { "user-email": userEmail },
    });
    return response.data;
  },

  search: async (params = {}) => {
    const response = await api.get("/api/products/search", { params });
    return response.data;
  },
};

export const wishlistAPI = {
  getAll: async () => {
    const response = await api.get("/api/wishlist");
    return response.data;
  },

  add: async (productId) => {
    const response = await api.post("/api/wishlist", { productId });
    return response.data;
  },

  remove: async (productId) => {
    const response = await api.delete(`/api/wishlist/${productId}`);
    return response.data;
  },

  check: async (productId) => {
    const response = await api.get(`/api/wishlist/check/${productId}`);
    return response.data;
  },

  clear: async () => {
    const response = await api.delete("/api/wishlist");
    return response.data;
  },
};

export default api;
