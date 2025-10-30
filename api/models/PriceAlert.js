import mongoose from "mongoose";

const priceAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    targetPrice: {
      type: Number,
      required: true,
      min: [0, "Target price cannot be negative"],
    },
    lastCheckedPrice: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

priceAlertSchema.index({ user: 1, product: 1 }, { unique: true });

priceAlertSchema.index({ isActive: 1, notificationSent: 1 });

const PriceAlert = mongoose.model("PriceAlert", priceAlertSchema);

export default PriceAlert;
