import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for efficient querying
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true }); // Ensure one review per user per product

// Post-save hook to update product rating and reviews count
reviewSchema.post('save', async function() {
  try {
    const Product = mongoose.model('Product');

    // Get all reviews for this product
    const reviews = await mongoose.model('Review').find({ product: this.product });

    if (reviews.length > 0) {
      // Calculate new average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      // Update product with new rating and reviews count
      await Product.findByIdAndUpdate(this.product, {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviews: reviews.length
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
});

// Post-remove hook to update product rating when review is deleted
reviewSchema.post('remove', async function() {
  try {
    const Product = mongoose.model('Product');

    // Get remaining reviews for this product
    const reviews = await mongoose.model('Review').find({ product: this.product });

    if (reviews.length > 0) {
      // Calculate new average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      // Update product with new rating and reviews count
      await Product.findByIdAndUpdate(this.product, {
        rating: Math.round(averageRating * 10) / 10,
        reviews: reviews.length
      });
    } else {
      // No reviews left, reset rating and reviews count
      await Product.findByIdAndUpdate(this.product, {
        rating: 0,
        reviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating product rating after review removal:', error);
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;