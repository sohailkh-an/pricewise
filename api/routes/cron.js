import express from "express";
import PriceAlert from "../models/PriceAlert.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { scrapeProductPrice } from "../utils/scraper.js";
import { sendPriceDropEmail } from "../utils/emailService.js";

const router = express.Router();

const verifyCronSecret = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Received Authorization Header:", authHeader);
  console.log("Extracted Token:", token);
  console.log("Expected Secret from ENV:", process.env.CRON_SECRET);
  console.log("Match:", token === process.env.CRON_SECRET);

  if (token !== process.env.CRON_SECRET) {
    console.error("Unauthorized: Token mismatch");
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  next();
};

router.post("/check-prices", verifyCronSecret, async (req, res) => {
  const startTime = Date.now();

  try {
    console.log("Starting price check job...");
    console.log(`Time: ${new Date().toISOString()}`);

    const alerts = await PriceAlert.find({
      isActive: true,
      notificationSent: false,
    })
      .populate({
        path: "product",
        select: "title images category subCategory priceComparison",
      })
      .populate({
        path: "user",
        select: "email name",
      });

    console.log(`Found ${alerts.length} active alerts to check`);

    if (alerts.length === 0) {
      console.log("No alerts to process");
      return res.json({
        success: true,
        message: "No alerts to process",
        results: { checked: 0, triggered: 0, failed: 0 },
      });
    }

    const results = {
      checked: 0,
      triggered: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES = 3000;

    for (let i = 0; i < alerts.length; i += BATCH_SIZE) {
      const batch = alerts.slice(i, i + BATCH_SIZE);

      console.log(
        `\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
          alerts.length / BATCH_SIZE
        )}`
      );

      await Promise.all(
        batch.map(async (alert) => {
          try {
            if (!alert.product) {
              console.log(`Skipping alert ${alert._id}: Product deleted`);
              results.skipped++;

              alert.isActive = false;
              await alert.save();
              return;
            }

            results.checked++;

            console.log(`\nChecking: ${alert.product.title}`);
            console.log(`User: ${alert.user.email}`);
            console.log(`Target: Rs.${alert.targetPrice.toLocaleString()}`);

            const priceData = await scrapeProductPrice(alert.product);

            if (!priceData.success || !priceData.lowestPrice) {
              console.log(`Could not fetch price`);
              results.failed++;
              results.errors.push({
                product: alert.product.title,
                user: alert.user.email,
                error: "Failed to scrape price",
              });
              return;
            }

            const currentPrice = priceData.lowestPrice;
            const oldPrice = alert.lastCheckedPrice || currentPrice;

            console.log(`Current: Rs.${currentPrice.toLocaleString()}`);
            console.log(`Target: Rs.${alert.targetPrice.toLocaleString()}`);

            alert.lastCheckedPrice = currentPrice;

            if (currentPrice <= alert.targetPrice) {
              console.log(`PRICE DROP DETECTED!`);

              const emailResult = await sendPriceDropEmail({
                to: alert.user.email,
                productTitle: alert.product.title,
                oldPrice:
                  oldPrice > currentPrice ? oldPrice : alert.targetPrice + 1000,
                newPrice: currentPrice,
                productUrl: `${process.env.FRONTEND_URL}/product/${alert.product._id}`,
                productImage: alert.product.images[0],
              });

              if (emailResult.success) {
                alert.notificationSent = true;
                alert.notificationSentAt = new Date();
                alert.isActive = false;
                results.triggered++;

                console.log(`Email sent successfully to ${alert.user.email}`);
              } else {
                console.error(`Failed to send email: ${emailResult.error}`);
                results.failed++;
                results.errors.push({
                  product: alert.product.title,
                  user: alert.user.email,
                  error: emailResult.error || "Email send failed",
                });
              }
            } else {
              console.log(
                `Price still above target (Rs.${
                  currentPrice - alert.targetPrice
                } away)`
              );
            }

            await alert.save();
          } catch (error) {
            console.error(
              `Error processing alert ${alert._id}:`,
              error.message
            );
            results.failed++;
            results.errors.push({
              alertId: alert._id,
              product: alert.product?.title || "Unknown",
              error: error.message,
            });
          }
        })
      );

      if (i + BATCH_SIZE < alerts.length) {
        console.log(
          `\nWaiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_BATCHES)
        );
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(50));
    console.log("Price check job completed");
    console.log(`Duration: ${duration}s`);
    console.log(`Results:`);
    console.log(`Checked: ${results.checked}`);
    console.log(`Triggered: ${results.triggered}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Skipped: ${results.skipped}`);
    if (results.errors.length > 0) {
      console.log(`Errors: ${results.errors.length}`);
      results.errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.product}: ${err.error}`);
      });
    }
    console.log("=".repeat(50));

    res.json({
      success: true,
      message: "Price check completed",
      results,
      duration: `${duration}s`,
    });
  } catch (error) {
    console.error("Price check job error:", error);
    res.status(500).json({
      success: false,
      message: "Price check failed",
      error: error.message,
    });
  }
});

router.post("/test-alert/:alertId", verifyCronSecret, async (req, res) => {
  try {
    const alert = await PriceAlert.findById(req.params.alertId)
      .populate("product")
      .populate("user");

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    console.log(`Testing alert for: ${alert.product.title}`);

    const priceData = await scrapeProductPrice(alert.product);

    if (!priceData.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to scrape price",
        priceData,
      });
    }

    const emailResult = await sendPriceDropEmail({
      to: alert.user.email,
      productTitle: alert.product.title,
      oldPrice: alert.targetPrice + 1000,
      newPrice: priceData.lowestPrice,
      productUrl: `${process.env.FRONTEND_URL}/product/${alert.product._id}`,
      productImage: alert.product.images[0],
    });

    res.json({
      success: true,
      message: "Test completed",
      data: {
        alert: {
          targetPrice: alert.targetPrice,
          currentPrice: priceData.lowestPrice,
          wouldTrigger: priceData.lowestPrice <= alert.targetPrice,
        },
        priceData,
        emailResult,
      },
    });
  } catch (error) {
    console.error("Test alert error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Cron service is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
