import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../services/api.js";

export const useRecommendations = (productId, limit = 8) => {
  return useQuery({
    queryKey: ["recommendations", productId],
    queryFn: async () => {
      const response = await api.get(
        `/api/recommendations/${productId}?limit=${limit}`
      );
      return response.data;
    },
    enabled: !!productId,
  });
};

export const useTrackView = () => {
  return useMutation({
    mutationFn: async ({ sourceProductId, targetProductIds }) => {
      let sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        localStorage.setItem("sessionId", sessionId);
      }

      await api.post("/api/recommendations/track-view", {
        sourceProductId,
        targetProductIds,
        sessionId,
      });
    },
  });
};

export const useTrackClick = () => {
  return useMutation({
    mutationFn: async ({ sourceProductId, targetProductId }) => {
      let sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        localStorage.setItem("sessionId", sessionId);
      }

      await api.post("/api/recommendations/track-click", {
        sourceProductId,
        targetProductId,
        sessionId,
      });
    },
  });
};
