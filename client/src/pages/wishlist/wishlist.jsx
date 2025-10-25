import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  useWishlist,
  useRemoveFromWishlist,
  useClearWishlist,
} from "../../hooks/useWishlist";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Heart,
  Trash2,
  ShoppingBag,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const WishlistPage = () => {
  const { user } = useAuth();
  const { data: wishlistData, isLoading, error } = useWishlist();

  console.log("Wishlist data:", wishlistData);
  const removeFromWishlist = useRemoveFromWishlist();
  const clearWishlist = useClearWishlist();
  const [removingItems, setRemovingItems] = useState(new Set());

  const handleRemoveItem = async (productId, productName) => {
    setRemovingItems((prev) => new Set([...prev, productId]));
    try {
      await removeFromWishlist.mutateAsync(productId);
      toast.success(`${productName} removed from wishlist`);
    } catch {
      toast.error("Failed to remove item from wishlist");
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleClearWishlist = async () => {
    if (
      window.confirm("Are you sure you want to clear your entire wishlist?")
    ) {
      try {
        await clearWishlist.mutateAsync();
        toast.success("Wishlist cleared successfully");
      } catch {
        toast.error("Failed to clear wishlist");
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Login Required
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Please login to view your wishlist
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Wishlist
            </h2>
            <p className="text-gray-600 text-center">
              {error.message || "Something went wrong. Please try again."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const wishlistItems = wishlistData?.data || [];
  const itemCount = wishlistData?.count || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your wishlist
            </p>
          </div>
          {itemCount > 0 && (
            <Button
              variant="outline"
              onClick={handleClearWishlist}
              disabled={clearWishlist.isPending}
              className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {itemCount === 0 ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Heart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Start adding products you love to your wishlist
              </p>
              <Button asChild>
                <Link to="/search">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const product = item.product;
              const isRemoving = removingItems.has(product._id);

              return (
                <Card
                  key={item._id}
                  className="group flex flex-col hover:shadow-lg transition-shadow duration-200"
                >
                  <CardHeader className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                      {product.images ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                      {product.brand && (
                        <Badge variant="outline" className="text-xs">
                          {product.brand}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
                      {product.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      {/* {product.rating && ( */}
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < Math.floor(product.rating)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-sm text-gray-600 ml-1">
                            ({product.reviews})
                          </span>
                        </div>
                      </div>
                      {/* )} */}
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex gap-2 mt-auto">
                    <Button asChild className="flex-1" size="sm">
                      <Link to={`/product/${product._id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleRemoveItem(product._id, product.title)
                      }
                      disabled={isRemoving}
                      className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 " />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
