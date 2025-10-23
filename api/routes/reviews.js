import express from "express";
import Review from "../models/Review.js";
import mongoose from "mongoose";
const router = express.Router();

router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("product", "title");

    const total = await Review.countDocuments({ product: productId });

    const avgRatingResult = await Review.aggregate([
      { $match: { product: productId } },
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

// Add a new review
router.post("/", async (req, res) => {
  try {
    const { productId, userName, userEmail, rating, comment } = req.body;

    // Validate required fields
    if (!productId || !userName || !userEmail || !rating || !comment) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      userEmail: userEmail.toLowerCase(),
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this product" });
    }

    const review = new Review({
      product: productId,
      userName: userName.trim(),
      userEmail: userEmail.toLowerCase().trim(),
      rating,
      comment: comment.trim(),
    });

    await review.save();

    // Populate product info for response
    await review.populate("product", "title");

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
    res.status(500).json({ error: "Failed to add review" });
  }
});

// Get review statistics for a product
router.get("/stats/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const stats = await Review.aggregate([
      { $match: { product: productId } },
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

// Delete review (Admin only)
router.delete("/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
