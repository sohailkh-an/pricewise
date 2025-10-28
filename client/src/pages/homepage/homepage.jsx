import * as React from "react";
import { ProductCard } from "../../components/ui/ProductCard";
import { Carousel } from "../../components/ui/carousel";
import { Button } from "../../components/ui/button";
import { useProductsByCategory } from "../../hooks/useProducts";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
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
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to PriceWise
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover amazing products at unbeatable prices
          </p>
        </div>
      </section>

      <section className="w-full bg-gray-50">
        {categories.map((category) => (
          <CategorySection key={category.key} category={category} />
        ))}
      </section>

      {/* <section className="bg-secondary/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-8">
            Get the latest deals and product updates delivered to your inbox
          </p>
          <div className="flex max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section> */}
    </div>
  );
};

const CategorySection = ({ category }) => {
  const { data, isLoading, error } = useProductsByCategory(category.key, {
    limit: 8,
  });

  if (isLoading) {
    return (
      // <div className="mb-16 w-full bg-gray-50">
      <div className="mb-16 w-full bg-[#f5f5f7]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{category.name}</h2>
          <Button variant="outline" disabled>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
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

      <Carousel itemsPerView={4} className="mb-4 w-full">
        {products.map((product) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </Carousel>
    </div>
  );
};

export default HomePage;
