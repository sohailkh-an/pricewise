import { useEffect, useState } from "react";
import * as React from "react";
import { useParams } from "react-router-dom";
import { useProduct } from "../../hooks/useProducts";
import { useMultiPriceComparison } from "../../hooks/useMultiPriceComparison";
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
  ShoppingCart,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  Loader2,
  Maximize2,
} from "lucide-react";

const ProductPage = () => {
  const { id } = useParams();
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const openImageViewer = (index) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

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
      <div className=" w-full px-6 py-8">
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Home</span>
            <span>/</span>
            <span className="capitalize">{product.category}</span>
            <span>/</span>
            <span className="capitalize">{product.subCategory}</span>
            <span>/</span>
            <span className="text-foreground">{product.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div className="space-y-4 rounded-lg bg-gray-100 p-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group">
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
                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer"
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

            <Card background="priceComparison" size="priceComparison">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  Price Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                {priceLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading price data...</span>
                  </div>
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
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-grey dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-800 dark:text-green-200">
                            {priceData?.store1?.platform}
                          </span>

                          <Badge variant="success">Best Price</Badge>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={priceData?.store1?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit Store
                          </a>
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            Rs. {formatNumber(priceData?.store1?.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-green-900/20 rounded-lg border border-grey dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-800 dark:text-green-200">
                            {priceData?.store2?.platform}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={priceData?.store2?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit Store
                          </a>
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            Rs. {formatNumber(priceData?.store2?.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-green-900/20 rounded-lg border border-grey dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-800 dark:text-green-200">
                            {priceData?.store3?.platform}
                          </span>
                          {priceData?.store3?.isBestPrice && (
                            <Badge variant="success">Best Price</Badge>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={priceData?.store3?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit Store
                          </a>
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            Rs. {formatNumber(priceData?.store3?.price)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Other Platforms</span>
                        <span className="text-sm text-muted-foreground">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Price comparison from Daraz, PriceOye, and other
                        platforms will be available soon.
                      </p>
                    </div> */}
                  </div>
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

            <Button size="lg" className="w-full">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="col-span-2" size="sm">
            <CardHeader>
              <CardTitle>Description</CardTitle>
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

          {product.tags && product.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="w-full px-6 py-8">
        <ReviewsSection productId={product._id} />
      </div>

      {/* Image Viewer Modal */}
      <ImageViewer
        images={product.images}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        initialIndex={selectedImageIndex}
      />
    </div>
  );
};

export default ProductPage;
