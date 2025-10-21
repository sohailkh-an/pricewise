import * as React from "react";
import { useParams } from "react-router-dom";
import { usePriceComparison } from "../../hooks/usePriceComparison";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Star,
  ShoppingCart,
  ExternalLink,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const ProductPage = () => {
  const { id } = useParams();
  const {
    data: priceData,
    isLoading,
    error,
  } = usePriceComparison(
    "https://telemart.pk/haier-h32s80efx-32-inch-qled-google-tv-with-official-warranty"
  );

  console.log("Price Data", priceData);

  const product = {
    id: id,
    title: "Haier H32S80EFX 32-inch QLED Google TV",
    description:
      "Experience stunning picture quality with this 32-inch QLED Google TV from Haier. Features 4K resolution, built-in Google Assistant, and multiple connectivity options.",
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=400&fit=crop",
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=500&h=400&fit=crop",
      "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=400&fit=crop",
    ],
    specifications: {
      "Screen Size": "32 inches",
      Resolution: "4K UHD",
      "Smart TV": "Google TV",
      HDR: "HDR10",
      "Refresh Rate": "60Hz",
      Connectivity: "WiFi, Bluetooth, HDMI x3, USB x2",
    },
    features: [
      "Quantum Dot Technology",
      "Dolby Vision & Dolby Atmos",
      "Built-in Chromecast",
      "Voice Control with Google Assistant",
      "Multiple App Support",
    ],
    rating: 4.2,
    reviewCount: 1247,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Failed to load price data</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Home</span>
            <span>/</span>
            <span>Electronics</span>
            <span>/</span>
            <span>Televisions</span>
            <span>/</span>
            <span className="text-foreground">{product.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.slice(1).map((image, index) => (
                <div
                  key={index}
                  className="aspect-video bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
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
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{product.rating}</span>
                <span className="text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  Price Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                {priceData ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-800 dark:text-green-200">
                            {priceData.telemartPrice.platform}
                          </span>
                          <Badge variant="success">Best Price</Badge>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={priceData.telemartPrice.url}
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
                            {priceData.telemartPrice.price}
                          </p>
                          {priceData.telemartPrice.originalPrice &&
                            priceData.telemartPrice.originalPrice !==
                              priceData.telemartPrice.price && (
                              <p className="text-sm text-muted-foreground line-through">
                                {priceData.telemartPrice.originalPrice}
                              </p>
                            )}
                        </div>
                        {priceData.telemartPrice.discountedPrice && (
                          <Badge variant="success" className="ml-auto">
                            Save{" "}
                            {priceData.telemartPrice.originalPrice -
                              priceData.telemartPrice.discountedPrice}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-800 dark:text-green-200">
                            {priceData.megaPrice.platform}
                          </span>
                          <Badge variant="success">Best Price</Badge>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={priceData.megaPrice.url}
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
                            {priceData.megaPrice.price}
                          </p>
                          {priceData.megaPrice.originalPrice &&
                            priceData.megaPrice.originalPrice !==
                              priceData.megaPrice.price && (
                              <p className="text-sm text-muted-foreground line-through">
                                {priceData.megaPrice.originalPrice}
                              </p>
                            )}
                        </div>
                        {priceData.megaPrice.discountedPrice && (
                          <Badge variant="success" className="ml-auto">
                            Save PKR
                            {priceData.megaPrice.originalPrice -
                              priceData.megaPrice.discountedPrice}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border">
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
                    </div>
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
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">{key}</dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
