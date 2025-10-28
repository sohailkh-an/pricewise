import express from "express";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlistItems = await Wishlist.find({ user: userId })
      .populate("product")
      .sort({ createdAt: -1 });

    const validItems = wishlistItems.filter((item) => item.product);

    res.json({
      success: true,
      data: validItems,
      count: validItems.length,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingWishlistItem = await Wishlist.findOne({
      user: userId,
      product: productId,
    });

    if (existingWishlistItem) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    const wishlistItem = new Wishlist({
      user: userId,
      product: productId,
    });

    await wishlistItem.save();
    await wishlistItem.populate("product");

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      data: wishlistItem,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.delete("/:productId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOneAndDelete({
      user: userId,
      product: productId,
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    res.json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/check/:productId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOne({
      user: userId,
      product: productId,
    });

    res.json({
      success: true,
      inWishlist: !!wishlistItem,
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.delete("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Wishlist.deleteMany({ user: userId });

    res.json({
      success: true,
      message: "Wishlist cleared",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
