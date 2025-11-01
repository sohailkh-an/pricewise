import { useEffect, useState } from "react";
import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct } from "../../hooks/useProducts";
import { useMultiPriceComparison } from "../../hooks/useMultiPriceComparison";
import { useToggleWishlist, useWishlistCheck } from "../../hooks/useWishlist";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import ImageViewer from "../../components/ui/ImageViewer";
import { ReviewsSection } from "../../components/reviews";
import {
  Star,
  ExternalLink,
  TrendingDown,
  Loader2,
  Maximize2,
  Heart,
  Bell,
} from "lucide-react";
import { SmartRecommendations } from "@/components/recommendations/SmartRecommendations";

import PlatformLogos from "@/static-data/platformLogos";

import { PriceAlertForm } from "../../components/ui/PriceAlertForm";
import { api } from "../../services/api";
const ProductPage = () => {
  const { id } = useParams();
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [existingAlert, setExistingAlert] = useState(null);
  const [alertsLoading, setAlertsLoading] = useState(false);

  const { user } = useAuth();
  const { data: wishlistCheck } = useWishlistCheck(id);
  const { toggleWishlist, isLoading: wishlistLoading } = useToggleWishlist();

  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useProduct(id);

  const {
    data: priceData,
    isLoading: priceLoading,
    error: priceError,
  } = useMultiPriceComparison(product);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchExistingAlert = async () => {
      if (!user || !product?._id) return;
      try {
        setAlertsLoading(true);
        const response = await api.get("/api/price-alerts");
        const alerts = response.data?.data || [];
        const matched = alerts.find(
          (a) => (a.product?._id || a.product) === product._id
        );
        setExistingAlert(matched || null);
      } catch {
        setExistingAlert(null);
      } finally {
        setAlertsLoading(false);
      }
    };
    fetchExistingAlert();
  }, [user, product?._id]);

  const openImageViewer = (index) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error("Please login to add items to your wishlist");
      return;
    }

    try {
      await toggleWishlist(id);
      const isInWishlist = wishlistCheck?.inWishlist;
      toast.success(
        isInWishlist ? "Removed from wishlist" : "Added to wishlist"
      );
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const handlePriceAlert = () => {
    if (!user) {
      toast.error("Please login to set price alerts");
      return;
    }

    if (!priceData || priceData.length === 0) {
      toast.error("Price data not available");
      return;
    }

    setAlertDialogOpen(true);
  };

  const handleRemovePriceAlert = async () => {
    if (!existingAlert?._id) return;
    try {
      await api.delete(`/api/price-alerts/${existingAlert._id}`);
      toast.success("Price alert removed");
      setExistingAlert(null);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to remove price alert";
      toast.error(message);
    }
  };

  const currentLowestPrice =
    priceData && priceData.length > 0
      ? Math.min(...priceData.map((p) => p.price))
      : null;

  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Product not found</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-6 py-8">
        <div className="w-full px-6 py-6 bg-muted/30 rounded-xl">
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/">
                <span>Home</span>
              </Link>
              <span>/</span>
              <Link to={`/search?category=${product.category}`}>
                <span className="capitalize">{product.category}</span>
              </Link>
              <span>/</span>
              <Link
                to={`/search?category=${product.category}&subCategory=${product.subCategory}`}
              >
                <span className="capitalize">{product.subCategory}</span>
              </Link>
              <span>/</span>
              <span className="text-foreground">{product.title}</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div className="space-y-4 rounded-lg bg-gray-100 p-4 h-min">
              <div className="border aspect-video bg-gray-100 rounded-lg overflow-hidden relative group">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openImageViewer(0)}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => openImageViewer(0)}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {product.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="border aspect-video bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer"
                      onClick={() => openImageViewer(index + 1)}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          openImageViewer(index + 1);
                        }}
                      >
                        <Maximize2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">
                    {product.rating || 0}
                  </span>
                  <span className="text-muted-foreground">
                    ({product.reviews || 0} reviews)
                  </span>
                </div>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.shortDescription}
              </p>

              <Card
                background="priceComparison"
                className="overflow-hidden"
                size="priceComparison"
              >
                <CardContent>
                  {priceLoading ? (
                    <>
                      <PriceComparisonCardSkeleton />
                      <PriceComparisonCardSkeleton />
                      <PriceComparisonCardSkeleton />
                    </>
                  ) : priceError ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Failed to load price data
                      </p>
                      <Button onClick={() => window.location.reload()}>
                        Try Again
                      </Button>
                    </div>
                  ) : priceData ? (
                    <PriceComparison comparisons={priceData} />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Price data not available
                      </p>
                      <Button onClick={() => window.location.reload()}>
                        Refresh Page
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                {user && (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleWishlistToggle}
                      disabled={wishlistLoading}
                      className={`flex-1 cursor-pointer ${
                        wishlistCheck?.inWishlist
                          ? "text-red-600 border-red-600 hover:bg-red-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 mr-2 ${
                          wishlistCheck?.inWishlist
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                      {!wishlistCheck?.inWishlist
                        ? "Add to Wishlist"
                        : "Remove from Wishlist"}
                    </Button>

                    {!existingAlert ? (
                      <Button
                        variant="default"
                        size="lg"
                        onClick={handlePriceAlert}
                        disabled={
                          !currentLowestPrice || priceLoading || alertsLoading
                        }
                        className="flex-1 cursor-pointer bg-[#041d09] hover:bg-[#1f5229]"
                      >
                        <Bell className="w-5 h-5 mr-2" />
                        Set Price Alert
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="default"
                          size="lg"
                          onClick={() => setAlertDialogOpen(true)}
                          disabled={!currentLowestPrice || priceLoading}
                          className="flex-1 cursor-pointer bg-[#041d09] hover:bg-[#1f5229]"
                        >
                          <Bell className="w-5 h-5 mr-2" />
                          Modify Price Alert
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleRemovePriceAlert}
                          className="flex-1 cursor-pointer text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Remove Price Alert
                        </Button>
                      </>
                    )}
                  </>
                )}

                {!user && (
                  <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm text-blue-800 mb-2">
                      Login to track price drops and save to wishlist
                    </p>
                    <Button asChild size="sm">
                      <Link to="/login">Login</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="col-span-2" size="sm">
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                {product.longDescription && (
                  <div className="mt-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {product.longDescription}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="w-full px-6 py-6 bg-muted/30 rounded-xl mt-10">
          <h2 className="text-2xl font-bold mb-6">Customer Feedback</h2>
          <ReviewsSection productId={product._id} />
        </div>

        <div className="w-full px-6 py-6 bg-muted/30 rounded-xl mt-10">
          <SmartRecommendations productId={product._id} />
        </div>
      </div>

      <ImageViewer
        images={product.images}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        initialIndex={selectedImageIndex}
      />

      {user && currentLowestPrice && (
        <PriceAlertForm
          product={product}
          currentLowestPrice={currentLowestPrice}
          open={alertDialogOpen}
          onOpenChange={setAlertDialogOpen}
          initialTargetPrice={existingAlert?.targetPrice}
          onSuccess={(alert) => setExistingAlert(alert)}
        />
      )}
    </div>
  );
};

export default ProductPage;

const PriceComparison = ({ comparisons }) => {
  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const prices = comparisons?.map((c) => c.price) || [];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const savings = maxPrice - minPrice;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <TrendingDown className="w-5 h-5 text-[#041d09] dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Price Comparison
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {comparisons?.length} stores available
            </p>
          </div>
        </div>

        {savings > 0 && (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          >
            Save up to Rs. {formatNumber(savings)}
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {comparisons?.map((comparison, index) => (
          <PriceComparisonCard
            key={index}
            platform={comparison.platform}
            url={comparison.url}
            price={comparison.price}
            isBestPrice={comparison.isBestPrice}
          />
        ))}
      </div>
    </div>
  );
};

const PriceComparisonCard = ({ platform, url, price, isBestPrice }) => {
  const getPlatformLogo = (platformUrl) => {
    if (!platformUrl) return null;
    const matchedPlatform = PlatformLogos.find(({ platform }) =>
      platformUrl.includes(platform)
    );
    return matchedPlatform ? matchedPlatform.logo : null;
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getPlatformLogoClass = (platform) => {
    const styles = {
      "priceoye.pk": "bg-[#48afff] p-0.5",
      "naheed.pk": "bg-red-600 p-0.5",
      "myshop.pk": "bg-black p-0.5",
    };
    return styles[platform] || "";
  };

  return (
    <div
      className={`
        relative group
        p-5 rounded-xl border-2 transition-all duration-300
        ${
          isBestPrice
            ? "bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border-[#041d09] dark:border-green-600"
            : "bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
        }
      `}
    >
      {isBestPrice && (
        <div className="absolute -top-3 -left-3 z-10">
          <Badge
            varient="secondary"
            className="bg-white border-[#041d09] border hover:bg-white text-black px-3 py-1.5 flex items-center gap-1"
          >
            <span className="text-xs font-semibold">Best Price</span>
          </Badge>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className={`
              w-35 h-10

              shrink-0 rounded-lg overflow-hidden 
              ${getPlatformLogoClass(platform)}
              ring-2 ring-offset-2 ring-gray-100 dark:ring-gray-700 dark:ring-offset-gray-800
              transition-transform duration-200 group-hover:scale-105
            `}
          >
            <img
              src={getPlatformLogo(url)}
              alt={platform}
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-1 truncate">
              {platform}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Rs.
              </span>
              <span
                className={`
                  text-3xl font-bold tracking-tight
                  ${
                    isBestPrice
                      ? "text-[#041d09] dark:text-green-400"
                      : "text-gray-900 dark:text-gray-100"
                  }
                `}
              >
                {formatNumber(price)}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant={isBestPrice ? "default" : "outline"}
          size="sm"
          asChild
          className={`
            shrink-0 transition-all duration-200 min-w-[120px]
            ${
              isBestPrice
                ? "bg-[#041d09] hover:bg-[#041d09] text-white shadow-md hover:shadow-lg hover:scale-105"
                : "hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-green-500"
            }
          `}
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="font-medium">
              {isBestPrice ? "Buy Now" : "Visit Store"}
            </span>
          </a>
        </Button>
      </div>

      {isBestPrice && (
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none" />
      )}
    </div>
  );
};
const PriceComparisonCardSkeleton = () => {
  return (
    <div className="p-4 bg-white dark:bg-green-900/20 rounded-lg border border-grey dark:border-green-800 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-[30px] w-[80px] bg-gray-200 dark:bg-gray-700 rounded shimmer" />

          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
        </div>

        <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
      </div>

      <div className="flex items-center gap-4">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
      </div>
    </div>
  );
};
