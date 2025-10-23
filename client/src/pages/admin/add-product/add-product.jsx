import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    longDescription: "",
    images: ["", "", ""],
    category: "",
    subCategory: "",
    brand: "",
    priceComparison: {
      platformOneUrl: "",
      platformTwoUrl: "",
      platformThreeUrl: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = {
    Shoes: [
      "Sneakers",
      "Boots",
      "Sandals",
      "Heels",
      "Sports Shoes",
      "Casual Shoes",
    ],
    Clothes: [
      "T-Shirts",
      "Jeans",
      "Dresses",
      "Jackets",
      "Shirts",
      "Pants",
      "Skirts",
    ],
    Tech: [
      "Smartphones",
      "Laptops",
      "Smart Watches",
      "Tablets",
      "Headphones",
      "Cameras",
      "Gaming",
      "Accessories",
    ],
    Cosmetics: [
      "Makeup",
      "Skincare",
      "Hair Care",
      "Fragrances",
      "Nail Care",
      "Tools & Brushes",
    ],
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value,
        subCategory: "",
      }));
    }
  };

  const handlePriceComparisonChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      priceComparison: {
        ...prev.priceComparison,
        [name]: value,
      },
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!user) {
      setError("You must be logged in to add products");
      setLoading(false);
      return;
    }

    if (user.email !== "sohail@studio2001.com") {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    try {
      const filteredImages = formData.images.filter((img) => img.trim() !== "");

      if (filteredImages.length === 0) {
        setError("At least one image is required");
        setLoading(false);
        return;
      }

      const productData = {
        ...formData,
        images: filteredImages,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-email": user.email,
          },
          body: JSON.stringify(productData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      const result = await response.json();
      console.log("Product created successfully:", result);

      setFormData({
        title: "",
        shortDescription: "",
        longDescription: "",
        images: ["", "", ""],
        category: "",
        subCategory: "",
        brand: "",
        priceComparison: {
          platformOneUrl: "",
          platformTwoUrl: "",
          platformThreeUrl: "",
        },
      });

      alert("Product created successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Add New Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter product title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description *</Label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Enter a brief description (10-500 characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
                <p className="text-sm text-gray-500">
                  {formData.shortDescription.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Long Description *</Label>
                <textarea
                  id="longDescription"
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleInputChange}
                  placeholder="Enter detailed description (50-5000 characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="6"
                  required
                />
                <p className="text-sm text-gray-500">
                  {formData.longDescription.length}/5000 characters
                </p>
              </div>

              <div className="space-y-4">
                <Label>Product Images *</Label>
                <p className="text-sm text-gray-500">
                  Add up to 3 image URLs (at least 1 required)
                </p>
                {formData.images.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`image-${index}`}>Image {index + 1}</Label>
                    <Input
                      id={`image-${index}`}
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder={`Enter image ${index + 1} URL`}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {Object.keys(categories).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subCategory">Sub Category *</Label>
                <select
                  id="subCategory"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.category}
                >
                  <option value="">Select a sub category</option>
                  {formData.category &&
                    categories[formData.category]?.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>
                        {subCategory}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  type="text"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Enter brand name"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">
                  Price Comparison URLs
                </Label>
                <p className="text-sm text-gray-500">
                  Add URLs from different platforms for price comparison
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformOneUrl">Platform 1 URL</Label>
                    <Input
                      id="platformOneUrl"
                      name="platformOneUrl"
                      type="url"
                      value={formData.priceComparison.platformOneUrl}
                      onChange={handlePriceComparisonChange}
                      placeholder="Enter first platform URL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platformTwoUrl">Platform 2 URL</Label>
                    <Input
                      id="platformTwoUrl"
                      name="platformTwoUrl"
                      type="url"
                      value={formData.priceComparison.platformTwoUrl}
                      onChange={handlePriceComparisonChange}
                      placeholder="Enter second platform URL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platformThreeUrl">Platform 3 URL</Label>
                    <Input
                      id="platformThreeUrl"
                      name="platformThreeUrl"
                      type="url"
                      value={formData.priceComparison.platformThreeUrl}
                      onChange={handlePriceComparisonChange}
                      placeholder="Enter third platform URL"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddProduct;
