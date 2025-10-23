import express from "express";
import Product from "../models/Product.js";
import { getTelemartPrice } from "../scrapers/telemartpk.js";
import { getShadenterprisespkPrice } from "../scrapers/shadenterprisespk.js";
import { getFriendsHomePrice } from "../scrapers/friendsHome.js";
const router = express.Router();

// Middleware to check if user is admin
const checkAdminAuth = (req, res, next) => {
  const userEmail = req.headers['user-email'] || req.body.userEmail;
  
  if (!userEmail) {
    return res.status(401).json({ error: "User email is required" });
  }
  
  if (userEmail !== "sohail@studio2001.com") {
    return res.status(403).json({ error: "Access denied. Admin privileges required." });
  }
  
  next();
};

// Get all products
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, category, subCategory, search } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (search) {
      query.$text = { $search: search };
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
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
      product
    });
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Validation error", 
        details: Object.values(error.errors).map(err => err.message) 
      });
    }
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update product (Admin only)
router.put("/:id", checkAdminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Validation error", 
        details: Object.values(error.errors).map(err => err.message) 
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

router.get("/test", (req, res) => {
  res.json({ message: "Test successful" });
});

router.get("/price", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const telemartPrice = await getTelemartPrice(url);
    const shadenterprisespkPrice = await getShadenterprisespkPrice(
      "https://shadenterprises.pk/product/haier-32-inch-smart-qled-tv-32s80efx/"
    );
    const friendsHomePrice = await getFriendsHomePrice(
      "https://friendshome.pk/products/haier-32-inch-smart-4k-qled-tv-model-32s80efx"
    );


    


    const stores = [
      { name: "storeOne", data: telemartPrice },
      { name: "storeTwo", data: shadenterprisespkPrice },
      { name: "storeThree", data: friendsHomePrice },
    ];

    stores.sort((a, b) => a.data.price - b.data.price);

    const priceData = {};
    stores.forEach((store, i) => {
      priceData[`store${i + 1}`] = store.data;
    });

    // const priceData = {
    //   storeOne: telemartPrice,
    //   storeTwo: shadenterprisespkPrice,
    //   storeThree: friendsHomePrice,
    // };

    if (!priceData) {
      return res.status(500).json({ error: "Failed to fetch price" });
    }

    console.log("Price data: ", priceData);

    res.json(priceData);
  } catch (error) {
    console.error("Error fetching price:", error);
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

export default router;
