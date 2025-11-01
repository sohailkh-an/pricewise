import express from "express";
import Review from "../models/Review.js";
import mongoose from "mongoose";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
const router = express.Router();

router.get("/product/:productId", optionalAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const reviews = await Review.find({ product: productObjectId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("product", "title")
      .populate("user", "fullName email");

    const total = await Review.countDocuments({ product: productObjectId });

    const avgRatingResult = await Review.aggregate([
      { $match: { product: productObjectId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const averageRating =
      avgRatingResult.length > 0 ? avgRatingResult[0].averageRating : 0;
    const reviewCount =
      avgRatingResult.length > 0 ? avgRatingResult[0].count : 0;

    res.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviewCount,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;

    console.log("Review productId and userId:", productId, userId);

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this product" });
    }

    const review = new Review({
      product: productId,
      user: userId,
      rating,
      comment: comment.trim(),
    });

    await review.save();

    await review.populate("product", "title");
    await review.populate("user", "name email");

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }
    if (error.code === 11000) {
      const existingReview = await Review.findOne({
        product: productId,
        user: userId,
      });
      if (existingReview) {
        return res
          .status(400)
          .json({ error: "You have already reviewed this product" });
      }
      return res.status(400).json({
        error: "Unable to add review. Please try again or contact support.",
      });
    }
    res.status(500).json({ error: "Failed to add review" });
  }
});

router.get("/stats/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const stats = await Review.aggregate([
      { $match: { product: productObjectId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    }

    const result = stats[0];
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    result.ratingDistribution.forEach((rating) => {
      distribution[rating]++;
    });

    res.json({
      averageRating: Math.round(result.averageRating * 10) / 10,
      totalReviews: result.totalReviews,
      ratingDistribution: distribution,
    });
  } catch (error) {
    console.error("Error fetching review stats:", error);
    res.status(500).json({ error: "Failed to fetch review statistics" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "You can only delete your own reviews" });
    }

    const productId = review.product.toString();

    await Review.findByIdAndDelete(req.params.id);

    try {
      const Product = mongoose.model("Product");
      const reviews = await Review.find({ product: productId });

      if (reviews.length > 0) {
        const totalRating = reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const averageRating = totalRating / reviews.length;

        await Product.findByIdAndUpdate(productId, {
          rating: Math.round(averageRating * 10) / 10,
          reviews: reviews.length,
        });
      } else {
        await Product.findByIdAndUpdate(productId, {
          rating: 0,
          reviews: 0,
        });
      }
    } catch (error) {
      console.error(
        "Error updating product rating after review deletion:",
        error
      );
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
