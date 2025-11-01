import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const reviewsAPI = {
  getProductReviews: async (productId, params = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/product/${productId}?${new URLSearchParams(
        params
      )}`,
      {
        headers,
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch reviews");
    return response.json();
  },

  getReviewStats: async (productId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/stats/${productId}`
    );
    if (!response.ok) throw new Error("Failed to fetch review stats");
    return response.json();
  },

  addReview: async (reviewData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: "include",
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add review");
    }
    return response.json();
  },
};

export function useProductReviews(productId, params = {}) {
  return useQuery({
    queryKey: ["productReviews", productId, params],
    queryFn: () => reviewsAPI.getProductReviews(productId, params),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReviewStats(productId) {
  return useQuery({
    queryKey: ["reviewStats", productId],
    queryFn: () => reviewsAPI.getReviewStats(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewsAPI.addReview,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["productReviews", data.review.product],
      });
      queryClient.invalidateQueries({
        queryKey: ["reviewStats", data.review.product],
      });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete review");
      }
      const data = await response.json();
      return { ...data, reviewId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productReviews"],
      });
      queryClient.invalidateQueries({
        queryKey: ["reviewStats"],
      });
    },
  });
}
