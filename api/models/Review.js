import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

reviewSchema.post("save", async function () {
  try {
    const Product = mongoose.model("Product");

    const reviews = await mongoose
      .model("Review")
      .find({ product: this.product });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = totalRating / reviews.length;

      await Product.findByIdAndUpdate(this.product, {
        rating: Math.round(averageRating * 10) / 10,
        reviews: reviews.length,
      });
    }
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
});

reviewSchema.post("remove", async function () {
  try {
    const Product = mongoose.model("Product");

    const reviews = await mongoose
      .model("Review")
      .find({ product: this.product });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = totalRating / reviews.length;

      await Product.findByIdAndUpdate(this.product, {
        rating: Math.round(averageRating * 10) / 10,
        reviews: reviews.length,
      });
    } else {
      await Product.findByIdAndUpdate(this.product, {
        rating: 0,
        reviews: 0,
      });
    }
  } catch (error) {
    console.error("Error updating product rating after review removal:", error);
  }
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
