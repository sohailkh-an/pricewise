import { useEffect, useState } from "react";
import {
  useRecommendations,
  useTrackView,
  useTrackClick,
} from "../../hooks/useRecommendations";
import { ProductCard } from "../ui/ProductCard";
import { ProductCardSkeleton } from "../ui/ProductCardSkeleton";
import { Carousel } from "../ui/carousel";
import { useNavigate } from "react-router-dom";

export const SmartRecommendations = ({ productId }) => {
  const { data, isLoading } = useRecommendations(productId);
  const trackView = useTrackView();
  const trackClick = useTrackClick();
  const navigate = useNavigate();
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(window.innerWidth < 768 ? 1 : 4);
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

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
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
        <Carousel itemsPerView={itemsPerView} className="mb-4 w-full">
          {Array.from({ length: itemsPerView }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </Carousel>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>

      <Carousel itemsPerView={itemsPerView} className="mb-4 w-full">
        {data.data.slice(0, 10).map((product) => (
          <div
            key={product._id}
            onClick={() => handleProductClick(product._id)}
            className="cursor-pointer"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </Carousel>
    </div>
  );
};
