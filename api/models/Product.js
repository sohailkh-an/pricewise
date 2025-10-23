import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: [3, "Product title must be at least 3 characters long"],
      maxlength: [200, "Product title cannot exceed 200 characters"],
    },
    reviews: {
      type: Number,
      default: 0,
      min: [0, "Reviews count cannot be negative"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: function (v) {
          return v === 0 || (v >= 0.1 && v <= 5);
        },
        message: "Rating must be between 0 and 5",
      },
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      minlength: [10, "Short description must be at least 10 characters long"],
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },
    longDescription: {
      type: String,
      required: [true, "Long description is required"],
      trim: true,
      minlength: [50, "Long description must be at least 50 characters long"],
      maxlength: [5000, "Long description cannot exceed 5000 characters"],
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
      validate: {
        validator: function (v) {
          return v.length > 0 && v.length <= 10;
        },
        message: "Product must have at least 1 image and at most 10 images",
      },
    },
    priceComparison: {
      platformOneUrl: {
        type: String,
        trim: true,
      },
      platformTwoUrl: {
        type: String,
        trim: true,
      },
      platformThreeUrl: {
        type: String,
        trim: true,
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      minlength: [2, "Category must be at least 2 characters long"],
      maxlength: [100, "Category cannot exceed 100 characters"],
    },
    subCategory: {
      type: String,
      required: [true, "Sub category is required"],
      trim: true,
      minlength: [2, "Sub category must be at least 2 characters long"],
      maxlength: [100, "Sub category cannot exceed 100 characters"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [100, "Brand name cannot exceed 100 characters"],
    },

    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({
  title: "text",
  shortDescription: "text",
  longDescription: "text",
});
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

productSchema.methods.updateRating = function (
  newRating,
  incrementReviews = true
) {
  const currentTotal = this.rating * this.reviews;
  const newReviews = this.reviews + (incrementReviews ? 1 : 0);
  const newTotal = currentTotal + newRating;

  this.rating = newReviews > 0 ? newTotal / newReviews : 0;
  this.reviews = newReviews;

  return this.save();
};

productSchema.methods.addImage = function (imageUrl) {
  if (this.images.length < 10) {
    this.images.push(imageUrl);
    return this.save();
  }
  throw new Error("Maximum number of images (10) reached");
};

productSchema.methods.removeImage = function (imageUrl) {
  const index = this.images.indexOf(imageUrl);
  if (index > -1) {
    this.images.splice(index, 1);
    return this.save();
  }
  throw new Error("Image not found");
};

productSchema.methods.toJSON = function () {
  const productObject = this.toObject();
  return productObject;
};

const Product = mongoose.model("Product", productSchema);

export default Product;
