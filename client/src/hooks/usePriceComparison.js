import { useQuery } from "@tanstack/react-query";

export function usePriceComparison(productUrl) {
  return useQuery({
    queryKey: ["priceComparison", productUrl],
    queryFn: async () => {
      if (!productUrl) return null;

      const response = await fetch(`http://localhost:3000/api/products/price?url=${encodeURIComponent(productUrl)}`);

      if (!response.ok) {
        throw new Error("Failed to fetch price data");
      }

      return response.json();
    },
    enabled: !!productUrl,
    staleTime: 5 * 60 * 1000, 
    cacheTime: 10 * 60 * 1000, 
  });
}
