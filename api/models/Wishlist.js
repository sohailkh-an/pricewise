import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique combination of user and product
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

// Virtual for populated product data
wishlistSchema.virtual("productData", {
  ref: "Product",
  localField: "product",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtual fields are serialized
wishlistSchema.set("toJSON", { virtuals: true });
wishlistSchema.set("toObject", { virtuals: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
