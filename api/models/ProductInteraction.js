import mongoose from "mongoose";

const productInteractionSchema = new mongoose.Schema(
  {
    sourceProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    //   index: true,
    },
    targetProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    interactionType: {
      type: String,
      enum: ["view", "click", "wishlist"],
      default: "click",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    sessionId: {
      type: String,
      required: false,
    },
    clickCount: {
      type: Number,
      default: 1,
    },
    metadata: {
      userAgent: String,
      timestamp: Date,
    },
  },
  {
    timestamps: true,
  }
);

productInteractionSchema.index({ sourceProduct: 1, targetProduct: 1 });
productInteractionSchema.index({ sourceProduct: 1, clickCount: -1 });

const ProductInteraction = mongoose.model(
  "ProductInteraction",
  productInteractionSchema
);

export default ProductInteraction;
