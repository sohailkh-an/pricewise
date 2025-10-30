import express from "express";
import PriceAlert from "../models/PriceAlert.js";
import Product from "../models/Product.js";
import { authenticateToken } from "../middleware/auth.js";
import { scrapeProductPrice } from "../utils/scraper.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { productId, targetPrice } = req.body;
    const userId = req.user._id;

    if (!productId || !targetPrice) {
      return res.status(400).json({
        success: false,
        message: "Product ID and target price are required",
      });
    }

    if (targetPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Target price must be greater than 0",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log(`Fetching current price for: ${product.title}`);
    const priceData = await scrapeProductPrice(product);

    if (!priceData.success || !priceData.lowestPrice) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch current product price. Please try again later.",
      });
    }

    const currentLowestPrice = priceData.lowestPrice;

    if (targetPrice >= currentLowestPrice) {
      return res.status(400).json({
        success: false,
        message: `Target price (Rs.${targetPrice.toLocaleString()}) must be lower than current lowest price (Rs.${currentLowestPrice.toLocaleString()})`,
      });
    }

    let alert = await PriceAlert.findOne({
      user: userId,
      product: productId,
    });

    if (alert) {
      alert.targetPrice = targetPrice;
      alert.lastCheckedPrice = currentLowestPrice;
      alert.isActive = true;
      alert.notificationSent = false;
      alert.notificationSentAt = null;
      await alert.save();

      console.log(
        `Updated price alert for user ${userId}, product ${productId}`
      );

      return res.json({
        success: true,
        message: "Price alert updated successfully",
        data: alert,
      });
    }

    alert = await PriceAlert.create({
      user: userId,
      product: productId,
      targetPrice,
      lastCheckedPrice: currentLowestPrice,
    });

    console.log(
      `Created new price alert for user ${userId}, product ${productId}`
    );

    res.status(201).json({
      success: true,
      message:
        "Price alert created successfully! We'll email you when the price drops.",
      data: alert,
    });
  } catch (error) {
    console.error("Create price alert error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have an alert for this product",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const alerts = await PriceAlert.find({ user: userId })
      .populate({
        path: "product",
        select: "title images category subCategory brand",
      })
      .sort({ createdAt: -1 });

    const validAlerts = alerts.filter((alert) => alert.product !== null);

    res.json({
      success: true,
      data: validAlerts,
      count: validAlerts.length,
    });
  } catch (error) {
    console.error("Get price alerts error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/:alertId", authenticateToken, async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user._id;

    const alert = await PriceAlert.findOne({
      _id: alertId,
      user: userId,
    }).populate("product");

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("Get alert error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.delete("/:alertId", authenticateToken, async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user._id;

    const alert = await PriceAlert.findOneAndDelete({
      _id: alertId,
      user: userId,
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    console.log(`Deleted alert ${alertId} for user ${userId}`);

    res.json({
      success: true,
      message: "Price alert deleted successfully",
    });
  } catch (error) {
    console.error("Delete price alert error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.patch("/:alertId/toggle", authenticateToken, async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user._id;

    const alert = await PriceAlert.findOne({
      _id: alertId,
      user: userId,
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    alert.isActive = !alert.isActive;
    await alert.save();

    console.log(`Toggled alert ${alertId} active status to ${alert.isActive}`);

    res.json({
      success: true,
      message: `Alert ${
        alert.isActive ? "activated" : "deactivated"
      } successfully`,
      data: alert,
    });
  } catch (error) {
    console.error("Toggle alert error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
