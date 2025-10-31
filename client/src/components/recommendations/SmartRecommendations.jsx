import { useEffect } from "react";
import {
  useRecommendations,
  useTrackView,
  useTrackClick,
} from "../../hooks/useRecommendations";
import { ProductCard } from "../ui/ProductCard";
import { useNavigate } from "react-router-dom";

export const SmartRecommendations = ({ productId }) => {
  const { data, isLoading } = useRecommendations(productId);
  const trackView = useTrackView();
  const trackClick = useTrackClick();
  const navigate = useNavigate();

  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      const targetProductIds = data.data.map((product) => product._id);
      trackView.mutate({ sourceProductId: productId, targetProductIds });
    }
  }, [data, productId]);

  const handleProductClick = (targetProductId) => {
    trackClick.mutate({ sourceProductId: productId, targetProductId });
    navigate(`/product/${targetProductId}`);
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.data.slice(0, 8).map((product) => (
          <div
            key={product._id}
            onClick={() => handleProductClick(product._id)}
            className="cursor-pointer"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};
