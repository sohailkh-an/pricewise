import express from "express";
import { getTelemartPrice } from "../scrapers/telemartpk.js";
import { getMegapkPrice } from "../scrapers/megapk.js";
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Test successful" });
});

router.get("/price", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const telemartPrice = await getTelemartPrice(url);
    const megaPrice = await getMegapkPrice(
      "https://www.mega.pk/ledtv_products/25423/Haier-32S80EFX-32-inch-smart---QLED-TV.html"
    );
    const priceData = {
      telemartPrice,
      megaPrice,
    };
    if (!priceData) {
      return res.status(500).json({ error: "Failed to fetch price" });
    }

    res.json(priceData);
  } catch (error) {
    console.error("Error fetching price:", error);
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

export default router;
