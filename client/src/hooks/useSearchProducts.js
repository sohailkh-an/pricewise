import { useQuery } from "@tanstack/react-query";
import { productsAPI } from "../services/api";

export function useSearchProducts(params = {}) {
  return useQuery({
    queryKey: ["search-products", params],
    queryFn: () => productsAPI.search(params),
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    enabled: !!(params.search || params.category || params.subCategory),
  });
}
