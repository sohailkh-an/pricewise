import mongoose from "mongoose";

const recommendationScoreSchema = new mongoose.Schema(
  {
    sourceProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    //   index: true,
    },
    recommendations: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        score: {
          type: Number,
          default: 0,
        },
        clicks: {
          type: Number,
          default: 0,
        },
        views: {
          type: Number,
          default: 0,
        },
        clickThroughRate: {
          type: Number,
          default: 0,
        },
        lastInteraction: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

recommendationScoreSchema.index({ sourceProduct: 1 });

const RecommendationScore = mongoose.model(
  "RecommendationScore",
  recommendationScoreSchema
);

export default RecommendationScore;
