import { useQuery } from "@tanstack/react-query";
import { productsAPI } from "../services/api";
import axios from "axios";

export function useMultiPriceComparison(product) {
  return useQuery({
    queryKey: ["multiPriceComparison", product?._id, product?.priceComparison],
    queryFn: async () => {
      if (!product?.priceComparison) return null;

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/products/price`,
        product
      );

      if (!response.data) {
        throw new Error("Failed to fetch price data");
      }

      return response.data;
    },
    enabled:
      !!product?.priceComparison && !!product.priceComparison.platformOneUrl,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}
