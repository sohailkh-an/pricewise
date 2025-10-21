import * as React from "react";
import { ProductCard } from "../../components/ui/ProductCard";
import { Carousel } from "../../components/ui/carousel";
import { Button } from "../../components/ui/button";
import { productData } from "../../data/products";

const HomePage = () => {
  const categories = [
    { name: "Shoes", key: "shoes" },
    { name: "Cosmetics", key: "cosmetics" },
    { name: "Clothes", key: "clothes" },
    { name: "Technology", key: "technology" },
  ];

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

      <section className="py-16 px-5 w-full">
        {categories.map((category) => (
          <div key={category.key} className="mb-16 w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">{category.name}</h2>
              <Button variant="outline">Browse More {category.name}</Button>
            </div>

            <Carousel itemsPerView={4} className="mb-4 w-full">
              {productData[category.key].map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Carousel>
          </div>
        ))}
      </section>

      <section className="bg-secondary/20 py-16">
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
      </section>
    </div>
  );
};

export default HomePage;
