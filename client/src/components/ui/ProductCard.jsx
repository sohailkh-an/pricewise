import * as React from "react";
import { Star, Heart } from "lucide-react";
import { Card, CardTitle, CardHeader, CardContent, CardFooter } from "./card";
import { Button } from "./button";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToggleWishlist, useWishlistCheck } from "../../hooks/useWishlist";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";

function ProductCard({ product }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const { user } = useAuth();
  const productId = product._id || product.id;
  const { data: wishlistCheck } = useWishlistCheck(productId);
  const { toggleWishlist, isLoading } = useToggleWishlist();

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add items to your wishlist");
      return;
    }

    try {
      await toggleWishlist(productId);
      const isInWishlist = wishlistCheck?.inWishlist;
      toast.success(
        isInWishlist ? "Removed from wishlist" : "Added to wishlist"
      );
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <Link to={`/product/${productId}`}>
      <Card
        size="no_pad"
        height="homescreen"
        className="group flex flex-col h-full hover:shadow-lg transition-shadow duration-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="p-4 pb-0 flex-shrink-0">
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            {product.images ? (
              <img
                src={product.images?.[0]}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <ShoppingBag className="h-12 w-12" />
              </div>
            )}

            {user && isHovered && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 backdrop-blur-sm cursor-pointer z-10"
                onClick={handleWishlistToggle}
                disabled={isLoading}
              >
                <Heart
                  className={`h-4 w-4 ${
                    wishlistCheck?.inWishlist
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600"
                  }`}
                />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mb-2 min-h-[24px]">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                {product.category}
              </Badge>
              {product.brand && (
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {product.brand}
                </Badge>
              )}
            </div>

            <div className="flex items-center pr-2 flex-shrink-0">
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
              <span className="text-sm text-gray-600 ml-1 whitespace-nowrap">
                ({product.reviews})
              </span>
            </div>
          </div>

          <CardTitle className="text-lg font-semibold line-clamp-2 mb-2 h-[56px] overflow-hidden">
            {product.title}
          </CardTitle>
        </CardHeader>

        <CardFooter className="p-4 pt-0 mt-auto flex-shrink-0">
          <Button className="w-full" size="sm">
            View Product
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

export { ProductCard };
// import * as React from "react";
// import { Star, Heart } from "lucide-react";
// import { Card, CardContent, CardFooter } from "./card";
// import { Button } from "./button";
// import { Link } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";
// import { useToggleWishlist, useWishlistCheck } from "../../hooks/useWishlist";
// import { toast } from "sonner";

// function ProductCard({ product }) {
//   const [isHovered, setIsHovered] = React.useState(false);
//   const { user } = useAuth();
//   const productId = product._id || product.id;
//   const { data: wishlistCheck } = useWishlistCheck(productId);
//   const { toggleWishlist, isLoading } = useToggleWishlist();

//   const handleWishlistToggle = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!user) {
//       toast.error("Please login to add items to your wishlist");
//       return;
//     }

//     try {
//       await toggleWishlist(productId);
//       const isInWishlist = wishlistCheck?.inWishlist;
//       toast.success(
//         isInWishlist
//           ? "Removed from wishlist"
//           : "Added to wishlist"
//       );
//     } catch {
//       toast.error("Failed to update wishlist");
//     }
//   };

//   return (
//     <Card
//       className={`h-full transition-all duration-300 cursor-pointer relative ${
//         isHovered ? "scale-102" : ""
//       }`}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <Link to={`/product/${productId}`}>
//         <CardContent className="p-0">
//           <div className="aspect-[1/0.8] overflow-hidden rounded-t-xl relative">
//             <img
//               src={product.images?.[0] || product.image}
//               alt={product.title}
//               className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
//             />
//             {user && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 backdrop-blur-sm"
//                 onClick={handleWishlistToggle}
//                 disabled={isLoading}
//               >
//                 <Heart
//                   className={`h-4 w-4 ${
//                     wishlistCheck?.inWishlist
//                       ? "fill-red-500 text-red-500"
//                       : "text-gray-600"
//                   }`}
//                 />
//               </Button>
//             )}
//           </div>
//           <div className="p-4">
//             <h3 className="font-semibold text-sm mb-2 line-clamp-2">
//               {product.title}
//             </h3>
//             <div className="flex items-center gap-2 mb-2">
//               <div className="flex items-center">
//                 {[...Array(5)].map((_, i) => (
//                   <Star
//                     key={i}
//                     className={`w-3 h-3 ${
//                       i < Math.floor(product.rating || 0)
//                         ? "fill-yellow-400 text-yellow-400"
//                         : "text-gray-300"
//                     }`}
//                   />
//                 ))}
//               </div>
//               <span className="text-xs text-muted-foreground">
//                 ({product.rating || 0})
//               </span>
//             </div>
//             {/* <p className="font-bold text-lg text-primary">
//               {product.shortDescription || "View Details"}
//             </p> */}
//           </div>
//         </CardContent>
//         <CardFooter className="p-4 pt-0">
//           <Button className="w-full" size="sm">
//             View Product
//           </Button>
//         </CardFooter>
//       </Link>
//     </Card>
//   );
// }

// export { ProductCard };
