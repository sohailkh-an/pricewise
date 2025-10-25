import { useQuery } from "@tanstack/react-query";
import { productsAPI } from "../services/api";

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsAPI.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productsAPI.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

export function useProductsByCategory(category, params = {}) {
  return useQuery({
    queryKey: ["products", "category", category, params],
    queryFn: () => productsAPI.getByCategory(category, params),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

export function useProductRecommendations(productId, limit = 8) {
  return useQuery({
    queryKey: ["product", "recommendations", productId, limit],
    queryFn: () => productsAPI.getRecommendations(productId, limit),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}