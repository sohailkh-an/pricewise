import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export const wishlistKeys = {
  all: ["wishlist"],
  lists: () => [...wishlistKeys.all, "list"],
  list: (filters) => [...wishlistKeys.lists(), { filters }],
  details: () => [...wishlistKeys.all, "detail"],
  detail: (id) => [...wishlistKeys.details(), id],
  check: (productId) => [...wishlistKeys.all, "check", productId],
};

export const useWishlist = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: wishlistKeys.lists(),
    queryFn: wishlistAPI.getAll,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

export const useWishlistCheck = (productId) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: wishlistKeys.check(productId),
    queryFn: () => wishlistAPI.check(productId),
    enabled: !!user && !!productId,
    staleTime: 2 * 60 * 1000,
  });
};
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistAPI.add,
    onSuccess: (data, productId) => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });

      queryClient.setQueryData(wishlistKeys.check(productId), {
        success: true,
        inWishlist: true,
      });
    },
    onError: (error) => {
      console.error("Failed to add to wishlist:", error);
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistAPI.remove,
    onSuccess: (data, productId) => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });

      queryClient.setQueryData(wishlistKeys.check(productId), {
        success: true,
        inWishlist: false,
      });
    },
    onError: (error) => {
      console.error("Failed to remove from wishlist:", error);
    },
  });
};

export const useToggleWishlist = () => {
  const { user } = useAuth();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: wishlistData } = useWishlist();

  const toggleWishlist = async (productId) => {
    if (!user) {
      throw new Error("Please login to manage your wishlist");
    }

    const isInWishlist = wishlistData?.data?.some(
      (item) => item.product._id === productId
    );

    if (isInWishlist) {
      return removeFromWishlist.mutateAsync(productId);
    } else {
      return addToWishlist.mutateAsync(productId);
    }
  };

  return {
    toggleWishlist,
    isLoading: addToWishlist.isPending || removeFromWishlist.isPending,
    error: addToWishlist.error || removeFromWishlist.error,
  };
};

export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistAPI.clear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
    onError: (error) => {
      console.error("Failed to clear wishlist:", error);
    },
  });
};
