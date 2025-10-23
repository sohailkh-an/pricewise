import express from "express";
import Product from "../models/Product.js";
import { getPriceoyepkPrice } from "../scrapers/tech/laptop-notebooks/priceoyepk.js";
import { getEezepcComPrice } from "../scrapers/tech/laptop-notebooks/eezepc_com.js";
import { getShophiveComPrice } from "../scrapers/tech/laptop-notebooks/shophive_com.js";

import { getTelemartPrice } from "../scrapers/telemartpk.js";
import { getShadenterprisespkPrice } from "../scrapers/shadenterprisespk.js";
import { getFriendsHomePrice } from "../scrapers/friendsHome.js";
const router = express.Router();

const checkAdminAuth = (req, res, next) => {
  const userEmail = req.headers["user-email"] || req.body.userEmail;

  if (!userEmail) {
    return res.status(401).json({ error: "User email is required" });
  }

  if (userEmail !== "sohail@studio2001.com") {
    return res
      .status(403)
      .json({ error: "Access denied. Admin privileges required." });
  }

  next();
};

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, category, subCategory, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (search) {
      query.$text = { $search: search };
    }

    console.log("Query: ", query);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    console.log("Products: ", products);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Specific routes must come before generic :id route
router.get("/test", (req, res) => {
  res.json({ message: "Test successful" });
});

router.post("/price", async (req, res) => {
  try {
    const product = req.body;
    console.log("Product: ", product);

    // Handle multiple URLs (new functionality)
    if (product) {
      const urlArray = new Array(
        product.priceComparison.platformOneUrl,
        product.priceComparison.platformTwoUrl,
        product.priceComparison.platformThreeUrl
      );
      console.log("URL Array: ", urlArray);
      const pricePromises = [];

      for (const url of urlArray) {
        if (!url) continue;

        try {
          if (product.subCategory.toLowerCase() === "laptops") {
            if (url.includes("priceoye")) {
              pricePromises.push(getPriceoyepkPrice(url));
            } else if (url.includes("eezepc")) {
              pricePromises.push(getEezepcComPrice(url));
            } else if (url.includes("shophive")) {
              pricePromises.push(getShophiveComPrice(url));
            } else {
              pricePromises.push("Unknown domain");
            }
          } else if (
            product.subCategory.toLowerCase() === "smartphones" ||
            product.subCategory.toLowerCase() === "smart watches"
          ) {
            if (url.includes("priceoye")) {
              pricePromises.push(getPriceoyepkPrice(url));
            } else if (url.includes("eezepc")) {
              pricePromises.push(getEezepcComPrice(url));
            } else if (url.includes("shophive")) {
              pricePromises.push(getShophiveComPrice(url));
            } else {
              pricePromises.push("Unknown domain");
            }
          }
        } catch (error) {
          console.error(`Error processing URL ${url}:`, error);
          // Continue with other URLs even if one fails
        }
      }

      const results = await Promise.allSettled(pricePromises);
      const validResults = results
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => result.value);

      if (validResults.length === 0) {
        return res
          .status(500)
          .json({ error: "Failed to fetch any price data" });
      }

      validResults.sort((a, b) => a.price - b.price);

      const priceData = {};
      validResults.forEach((result, i) => {
        priceData[`store${i + 1}`] = result;
      });

      console.log("Multi-URL price data: ", priceData);
      return res.json(priceData);
    }

    return res.status(400).json({ error: "URL or URLs parameter is required" });
  } catch (error) {
    console.error("Error fetching price:", error);
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

// Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // console.log("Product: ", product);

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Create new product (Admin only)
router.post("/", checkAdminAuth, async (req, res) => {
  try {
    const productData = {
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      longDescription: req.body.longDescription,
      images: req.body.images,
      category: req.body.category,
      subCategory: req.body.subCategory,
      brand: req.body.brand,
      priceComparison: req.body.priceComparison,
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update product (Admin only)
router.put("/:id", checkAdminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product (Admin only)
router.delete("/:id", checkAdminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
