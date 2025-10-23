import * as React from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "./card";
import { Button } from "./button";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Card
      className={`h-full transition-all duration-300 cursor-pointer ${
        isHovered ? "scale-102" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product._id || product.id}`}>
        <CardContent className="p-0">
          <div className="aspect-[1/0.8] overflow-hidden rounded-t-xl">
            <img
              src={product.images?.[0] || product.image}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">
              {product.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.rating || 0})
              </span>
            </div>
            {/* <p className="font-bold text-lg text-primary">
              {product.shortDescription || "View Details"}
            </p> */}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full" size="sm">
            View Product
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}

export { ProductCard };
