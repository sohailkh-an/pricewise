import express from "express";
import ProductInteraction from "../models/ProductInteraction.js";
import RecommendationScore from "../models/RecommendationScore.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/getAllRecommendations", async (req, res) => {
  try {
    const recommendations = await RecommendationScore.find();
    res.json({ recommendations });
  } catch (error) {
    res.json({ error });
  }
});
router.get("/getAllInteractions", async (req, res) => {
  try {
    const interactions = await ProductInteraction.find();
    res.json({ interactions });
  } catch (error) {
    res.json({ error });
  }
});

router.post("/track-click", async (req, res) => {
  try {
    const { sourceProductId, targetProductId, userId, sessionId } = req.body;

    if (!sourceProductId || !targetProductId) {
      return res.status(400).json({
        success: false,
        message: "Source and target product IDs are required",
      });
    }

    const [sourceProduct, targetProduct] = await Promise.all([
      Product.findById(sourceProductId),
      Product.findById(targetProductId),
    ]);

    if (!sourceProduct || !targetProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await ProductInteraction.create({
      sourceProduct: sourceProductId,
      targetProduct: targetProductId,
      interactionType: "click",
      user: userId || null,
      sessionId: sessionId || null,
      metadata: {
        userAgent: req.headers["user-agent"],
        timestamp: new Date(),
      },
    });

    updateRecommendationScores(sourceProductId, targetProductId).catch(
      (err) => {
        console.error("Error updating recommendation scores:", err);
      }
    );

    res.json({
      success: true,
      message: "Click tracked successfully",
    });
  } catch (error) {
    console.error("Track click error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/track-view", async (req, res) => {
  try {
    const { sourceProductId, targetProductIds, userId, sessionId } = req.body;

    if (
      !sourceProductId ||
      !targetProductIds ||
      !Array.isArray(targetProductIds)
    ) {
      return res.status(400).json({
        success: false,
        message: "Source product ID and target product IDs array are required",
      });
    }

    const validTargetIds = targetProductIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validTargetIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid target product IDs provided",
      });
    }

    const sourceProduct = await Product.findById(sourceProductId);
    if (!sourceProduct) {
      return res.status(404).json({
        success: false,
        message: "Source product not found",
      });
    }

    const viewPromises = validTargetIds.map((targetId) =>
      ProductInteraction.create({
        sourceProduct: sourceProductId,
        targetProduct: targetId,
        interactionType: "view",
        user: userId || null,
        sessionId: sessionId || null,
        metadata: {
          userAgent: req.headers["user-agent"],
          timestamp: new Date(),
        },
      })
    );

    await Promise.all(viewPromises);

    console.log(
      `Views tracked: ${validTargetIds.length} products viewed from ${sourceProduct.title}`
    );

    updateRecommendationViewScores(sourceProductId, validTargetIds).catch(
      (err) => {
        console.error("Error updating view scores:", err);
      }
    );

    res.json({
      success: true,
      message: `${validTargetIds.length} views tracked successfully`,
      trackedCount: validTargetIds.length,
    });
  } catch (error) {
    console.error("Track view error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/analytics/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const [clickStats, viewStats, recommendations] = await Promise.all([
      ProductInteraction.aggregate([
        {
          $match: {
            sourceProduct: new mongoose.Types.ObjectId(productId),
            interactionType: "click",
          },
        },
        {
          $group: {
            _id: "$targetProduct",
            totalClicks: { $sum: 1 },
            uniqueUsers: { $addToSet: "$user" },
            lastClick: { $max: "$createdAt" },
          },
        },
      ]),
      ProductInteraction.aggregate([
        {
          $match: {
            sourceProduct: new mongoose.Types.ObjectId(productId),
            interactionType: "view",
          },
        },
        {
          $group: {
            _id: "$targetProduct",
            totalViews: { $sum: 1 },
          },
        },
      ]),
      RecommendationScore.findOne({ sourceProduct: productId })
        .populate("recommendations.product", "title images")
        .lean(),
    ]);

    const clickMap = new Map(
      clickStats.map((stat) => [stat._id.toString(), stat])
    );
    const viewMap = new Map(
      viewStats.map((stat) => [stat._id.toString(), stat])
    );

    const analytics =
      recommendations?.recommendations.map((rec) => {
        const productId = rec.product._id.toString();
        const clicks = clickMap.get(productId)?.totalClicks || 0;
        const views = viewMap.get(productId)?.totalViews || 0;
        const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : 0;

        return {
          product: rec.product,
          metrics: {
            score: rec.score,
            clicks: clicks,
            views: views,
            ctr: `${ctr}%`,
            uniqueUsers: clickMap.get(productId)?.uniqueUsers.length || 0,
            lastInteraction: rec.lastInteraction,
          },
        };
      }) || [];

    const totalClicks = clickStats.reduce(
      (sum, stat) => sum + stat.totalClicks,
      0
    );
    const totalViews = viewStats.reduce(
      (sum, stat) => sum + stat.totalViews,
      0
    );
    const overallCTR =
      totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        recommendations: analytics,
        summary: {
          totalRecommendations: analytics.length,
          totalClicks: totalClicks,
          totalViews: totalViews,
          overallCTR: `${overallCTR}%`,
          lastUpdated: recommendations?.lastUpdated,
        },
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 8;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const mlRecommendations = await RecommendationScore.findOne({
      sourceProduct: productId,
    })
      .populate({
        path: "recommendations.product",
        select: "title images rating reviews category subCategory brand",
      })
      .lean();

    let recommendations = [];
    let mlBased = false;
    const seenProductIds = new Set();

    if (mlRecommendations && mlRecommendations.recommendations.length > 0) {
      mlBased = true;
      recommendations = mlRecommendations.recommendations
        .filter((rec) => {
          if (!rec.product || seenProductIds.has(rec.product._id.toString())) {
            return false;
          }
          seenProductIds.add(rec.product._id.toString());
          return true;
        })
        .slice(0, limit)
        .map((rec) => ({
          ...rec.product,
          recommendationScore: rec.score,
          clicks: rec.clicks,
          views: rec.views,
          clickThroughRate: rec.clickThroughRate,
        }));
    }

    if (recommendations.length < limit) {
      const fallbackProducts = await Product.find({
        category: product.category,
        _id: {
          $ne: productId,
          $nin: Array.from(seenProductIds),
        },
        isActive: true,
      })
        .sort({ rating: -1, reviews: -1 })
        .limit(limit - recommendations.length)
        .select("title images rating reviews category subCategory brand")
        .lean();

      recommendations = [
        ...recommendations,
        ...fallbackProducts.map((p) => ({
          ...p,
          recommendationScore: 0,
          clicks: 0,
          views: 0,
          clickThroughRate: 0,
        })),
      ];
    }

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
      algorithm: mlBased ? "ml" : "category",
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.get("/:productId/stats", async (req, res) => {
  try {
    const { productId } = req.params;

    const stats = await ProductInteraction.aggregate([
      {
        $match: {
          sourceProduct: mongoose.Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: "$targetProduct",
          totalClicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user" },
          lastClick: { $max: "$createdAt" },
        },
      },
      {
        $project: {
          product: "$_id",
          totalClicks: 1,
          uniqueUserCount: { $size: "$uniqueUsers" },
          lastClick: 1,
        },
      },
      {
        $sort: { totalClicks: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    await Product.populate(stats, {
      path: "product",
      select: "title images",
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

async function updateRecommendationScores(sourceProductId, targetProductId) {
  try {
    const clickData = await ProductInteraction.aggregate([
      {
        $match: {
          sourceProduct: new mongoose.Types.ObjectId(`${sourceProductId}`),
          targetProduct: new mongoose.Types.ObjectId(`${targetProductId}`),
        },
      },
      {
        $group: {
          _id: "$targetProduct",
          totalClicks: { $sum: 1 },
          lastInteraction: { $max: "$createdAt" },
        },
      },
    ]);

    if (clickData.length === 0) return;

    const clicks = clickData[0].totalClicks;

    await RecommendationScore.findOneAndUpdate(
      { sourceProduct: sourceProductId },
      {
        $set: {
          lastUpdated: new Date(),
        },
        $pull: {
          recommendations: { product: targetProductId },
        },
      },
      { upsert: true }
    );

    await RecommendationScore.findOneAndUpdate(
      { sourceProduct: sourceProductId },
      {
        $push: {
          recommendations: {
            product: targetProductId,
            clicks: clicks,
            score: calculateScore(clicks),
            lastInteraction: clickData[0].lastInteraction,
          },
        },
      }
    );

    await RecommendationScore.findOneAndUpdate(
      { sourceProduct: sourceProductId },
      {
        $push: {
          recommendations: {
            $each: [],
            $sort: { score: -1 },
          },
        },
      }
    );
  } catch (error) {
    console.error("Error in updateRecommendationScores:", error);
  }
}

async function updateRecommendationViewScores(
  sourceProductId,
  targetProductIds
) {
  try {
    console.log("Updating view scores...");

    for (const targetProductId of targetProductIds) {
      const [viewData, clickData] = await Promise.all([
        ProductInteraction.aggregate([
          {
            $match: {
              sourceProduct: new mongoose.Types.ObjectId(sourceProductId),
              targetProduct: new mongoose.Types.ObjectId(targetProductId),
              interactionType: "view",
            },
          },
          {
            $group: {
              _id: "$targetProduct",
              totalViews: { $sum: 1 },
            },
          },
        ]),
        ProductInteraction.aggregate([
          {
            $match: {
              sourceProduct: new mongoose.Types.ObjectId(sourceProductId),
              targetProduct: new mongoose.Types.ObjectId(targetProductId),
              interactionType: "click",
            },
          },
          {
            $group: {
              _id: "$targetProduct",
              totalClicks: { $sum: 1 },
            },
          },
        ]),
      ]);

      const views = viewData[0]?.totalViews || 0;
      const clicks = clickData[0]?.totalClicks || 0;
      const ctr = views > 0 ? (clicks / views) * 100 : 0;

      let recommendationDoc = await RecommendationScore.findOne({
        sourceProduct: sourceProductId,
      });

      if (!recommendationDoc) {
        recommendationDoc = await RecommendationScore.create({
          sourceProduct: sourceProductId,
          recommendations: [],
        });
      }

      const existingIndex = recommendationDoc.recommendations.findIndex(
        (rec) => rec.product.toString() === targetProductId.toString()
      );

      const score = calculateAdvancedScore(clicks, views, ctr);

      if (existingIndex >= 0) {
        recommendationDoc.recommendations[existingIndex].clicks = clicks;
        recommendationDoc.recommendations[existingIndex].views = views;
        recommendationDoc.recommendations[existingIndex].clickThroughRate = ctr;
        recommendationDoc.recommendations[existingIndex].score = score;
        recommendationDoc.recommendations[existingIndex].lastInteraction =
          new Date();
      } else {
        recommendationDoc.recommendations.push({
          product: targetProductId,
          clicks: clicks,
          views: views,
          clickThroughRate: ctr,
          score: score,
          lastInteraction: new Date(),
        });
      }

      recommendationDoc.recommendations.sort((a, b) => b.score - a.score);
      recommendationDoc.lastUpdated = new Date();

      await recommendationDoc.save();

      console.log(
        `Updated: Views=${views}, Clicks=${clicks}, CTR=${ctr.toFixed(
          2
        )}%, Score=${score}`
      );
    }
  } catch (error) {
    console.error("Error in updateRecommendationViewScores:", error);
  }
}

function calculateAdvancedScore(clicks, views, ctr) {
  const clickWeight = 10;
  const viewWeight = 1;
  const ctrBonus = 50;

  const baseScore = clicks * clickWeight + views * viewWeight;
  const ctrScore = ctr * ctrBonus;
  const totalScore = baseScore + ctrScore;
  return Math.round(totalScore);
}

function calculateScore(clicks) {
  return clicks * 10;
}

export default router;
