import * as React from "react";
import { ProductCard } from "../../components/ui/ProductCard";
import { ProductCardSkeleton } from "../../components/ui/ProductCardSkeleton";
import { Carousel } from "../../components/ui/carousel";
import { Button } from "../../components/ui/button";
import { useProductsByCategory } from "../../hooks/useProducts";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const categories = [
    { name: "Technology", key: "Tech" },
    { name: "Cosmetics", key: "Cosmetics" },
    { name: "Home Appliances", key: "Home Appliances" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section
        className="relative bg-top bg-cover min-h-[50vh] flex items-center justify-center"
        style={{ backgroundImage: "url('/header_img.webp')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to PriceWise
          </h1>
          <p className="text-xl text-gray-200">
            Discover amazing products at unbeatable prices
          </p>
        </div>
      </section>

      <section className="w-full bg-gray-50">
        {categories.map((category) => (
          <CategorySection key={category.key} category={category} />
        ))}
      </section>
    </div>
  );
};

const CategorySection = ({ category }) => {
  const { data, isLoading, error } = useProductsByCategory(category.key, {
    limit: 10,
  });

  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(window.innerWidth < 768 ? 1 : 4);
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  if (isLoading) {
    return (
      <div className="py-10 px-5 w-full border-b">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{category.name}</h2>
          <Button variant="outline" disabled>
            Loading...
          </Button>
        </div>

        <Carousel itemsPerView={itemsPerView} className="mb-4 w-full">
          {Array.from({ length: itemsPerView }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </Carousel>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{category.name}</h2>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load products</p>
        </div>
      </div>
    );
  }

  const products = data?.products || [];

  if (products.length === 0) {
    return (
      <div className="mb-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{category.name}</h2>
          <Button variant="outline" disabled>
            No Products Available
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No products available in this category yet. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-5 w-full border-b">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">{category.name}</h2>
        <Button variant="outline" asChild>
          <Link to={`/search?category=${category.key}`}>
            Browse More {category.name}
          </Link>
        </Button>
      </div>

      <Carousel itemsPerView={itemsPerView} className="mb-4 w-full">
        {products.map((product) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </Carousel>
    </div>
  );
};

export default HomePage;
