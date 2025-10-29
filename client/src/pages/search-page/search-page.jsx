import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X, SlidersHorizontal, Star } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ProductCard } from "../../components/ui/ProductCard";
import { Select, SelectItem } from "../../components/ui/select";
import { useSearchProducts } from "../../hooks/useSearchProducts";
import { useDebounce } from "../../hooks/useDebounce";
import { Loader2 } from "lucide-react";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const debouncedSearchQuery = useDebounce(searchQuery, 1500);

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    subCategory: searchParams.get("subCategory") || "",
    minRating: searchParams.get("minRating") || "",
    sortBy: searchParams.get("sortBy") || "relevance",
    page: parseInt(searchParams.get("page")) || 1,
  });

  useEffect(() => {
    setFilters({
      category: searchParams.get("category") || "",
      subCategory: searchParams.get("subCategory") || "",
      minRating: searchParams.get("minRating") || "",
      sortBy: searchParams.get("sortBy") || "relevance",
      page: parseInt(searchParams.get("page")) || 1,
    });
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const { data, isLoading, error } = useSearchProducts({
    search: debouncedSearchQuery,
    ...filters,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (filters.category) params.set("category", filters.category);
    if (filters.subCategory) params.set("subCategory", filters.subCategory);
    if (filters.minRating) params.set("minRating", filters.minRating);
    if (filters.sortBy !== "relevance") params.set("sortBy", filters.sortBy);
    if (filters.page > 1) params.set("page", filters.page.toString());

    setSearchParams(params);
  }, [searchQuery, filters, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      subCategory: "",
      minRating: "",
      sortBy: "relevance",
      page: 1,
    });
    setSearchQuery("");
  };

  const categories = [
    { value: "Home Appliances", label: "Home Appliances" },
    { value: "Cosmetics", label: "Cosmetics" },
    { value: "Tech", label: "Tech" },
  ];

  const subCategories = {
    "Home Appliances": ["TV's", "Fridge", "Oven", "AC", "Washing Machine"],

    Tech: [
      "Smartphones",
      "Laptops",
      "Smart Watches",
      "Headphones",
      "Cameras",
      "Gaming",
      "Accessories",
    ],
    Cosmetics: ["Makeup", "Skincare", "Hair Care", "Fragrances"],
  };

  const sortOptions = [
    { value: "relevance", label: "Most Relevant" },
    { value: "newest", label: "Newest First" },
    { value: "rating", label: "Highest Rated" },
    { value: "reviews", label: "Most Reviews" },
  ];

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;
  const total = data?.total || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Products</h1>

          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="cursor-pointer flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </form>

          {(searchQuery ||
            filters.category ||
            filters.subCategory ||
            filters.minRating) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category:{" "}
                  {categories.find((c) => c.value === filters.category)?.label}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange("category", "")}
                  />
                </Badge>
              )}
              {filters.subCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Sub: {filters.subCategory}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange("subCategory", "")}
                  />
                </Badge>
              )}
              {filters.minRating && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Min Rating: {filters.minRating}+
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange("minRating", "")}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {total > 0 ? `${total} products found` : "No products found"}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
                className="cursor-pointer w-40"
              >
                {sortOptions.map((option) => (
                  <SelectItem className="w-full" value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Category
                    </label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) =>
                        handleFilterChange("category", value)
                      }
                      placeholder="All Categories"
                      className="cursor-pointer w-full"
                    >
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Sub Category
                    </label>

                    <Select
                      value={filters.subCategory}
                      onValueChange={(value) =>
                        handleFilterChange("subCategory", value)
                      }
                      className="cursor-pointer w-full"
                      disabled={!filters.category}
                    >
                      <SelectItem value="">Select a sub category</SelectItem>

                      {filters.category &&
                        subCategories[filters.category]?.map((subCategory) => (
                          <SelectItem key={subCategory} value={subCategory}>
                            {subCategory}
                          </SelectItem>
                        ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Minimum Rating
                    </label>
                    <Select
                      value={filters.minRating}
                      onValueChange={(value) =>
                        handleFilterChange("minRating", value)
                      }
                      placeholder="Any Rating"
                      className="cursor-pointer w-full"
                    >
                      <SelectItem value="">Any Rating</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="2">2+ Stars</SelectItem>
                      <SelectItem value="1">1+ Stars</SelectItem>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p>Searching products...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Failed to load products
                </p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleFilterChange("page", Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handleFilterChange("page", page)}
                            >
                              {page}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() =>
                        handleFilterChange(
                          "page",
                          Math.min(totalPages, currentPage + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
