import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Query keys
export const wishlistKeys = {
  all: ['wishlist'],
  lists: () => [...wishlistKeys.all, 'list'],
  list: (filters) => [...wishlistKeys.lists(), { filters }],
  details: () => [...wishlistKeys.all, 'detail'],
  detail: (id) => [...wishlistKeys.details(), id],
  check: (productId) => [...wishlistKeys.all, 'check', productId],
};

// Hook to get user's wishlist
export const useWishlist = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: wishlistKeys.lists(),
    queryFn: wishlistAPI.getAll,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to check if a product is in wishlist
export const useWishlistCheck = (productId) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: wishlistKeys.check(productId),
    queryFn: () => wishlistAPI.check(productId),
    enabled: !!user && !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to add product to wishlist
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: wishlistAPI.add,
    onSuccess: (data, productId) => {
      // Invalidate and refetch wishlist
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
      
      // Update the specific product's wishlist status
      queryClient.setQueryData(
        wishlistKeys.check(productId),
        { success: true, inWishlist: true }
      );
    },
    onError: (error) => {
      console.error('Failed to add to wishlist:', error);
    },
  });
};

// Hook to remove product from wishlist
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: wishlistAPI.remove,
    onSuccess: (data, productId) => {
      // Invalidate and refetch wishlist
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
      
      // Update the specific product's wishlist status
      queryClient.setQueryData(
        wishlistKeys.check(productId),
        { success: true, inWishlist: false }
      );
    },
    onError: (error) => {
      console.error('Failed to remove from wishlist:', error);
    },
  });
};

// Hook to toggle wishlist status
export const useToggleWishlist = () => {
  const { user } = useAuth();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: wishlistData } = useWishlist();
  
  const toggleWishlist = async (productId) => {
    if (!user) {
      throw new Error('Please login to manage your wishlist');
    }
    
    // Check if product is already in wishlist
    const isInWishlist = wishlistData?.data?.some(
      item => item.product._id === productId
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

// Hook to clear entire wishlist
export const useClearWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: wishlistAPI.clear,
    onSuccess: () => {
      // Invalidate all wishlist queries
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
    onError: (error) => {
      console.error('Failed to clear wishlist:', error);
    },
  });
};
