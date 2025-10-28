import express from "express";
import Product from "../models/Product.js";
import { getPriceoyepkPrice } from "../scrapers/tech/laptop-notebooks/priceoyepk.js";
import { getEezepcComPrice } from "../scrapers/tech/laptop-notebooks/eezepc_com.js";
import { getShophiveComPrice } from "../scrapers/tech/laptop-notebooks/shophive_com.js";
import { getChasevaluePrice } from "../scrapers/cosmetics/chasevalue.js";
import { getJust4girlspkPrice } from "../scrapers/cosmetics/just4girls_pk.js";
import { getMakeupstashpkPrice } from "../scrapers/cosmetics/makeupstash_pk.js";
import { getNaheedPrice } from "../scrapers/cosmetics/naheed_pk.js";
import { getTrendifypkPrice } from "../scrapers/cosmetics/trendify_pk.js";
import { getVegaspkPrice } from "../scrapers/cosmetics/vegas_pk.js";
import { getAysonlinePrice } from "../scrapers/home_appliances/aysonline.js";
import { getFriendsHomePrice } from "../scrapers/home_appliances/friendsHome.js";
import { getJalalelectronicsPrice } from "../scrapers/home_appliances/jalalelectronics.js";
import { getJapanelectronicsPrice } from "../scrapers/home_appliances/japanelectronics.js";
import { getLahorecentrePrice } from "../scrapers/home_appliances/lahorecentre.js";
import { getMegapkPrice } from "../scrapers/home_appliances/megapk.js";
import { getSohailelectronicsPrice } from "../scrapers/home_appliances/sohailelectronics.js";
import { getDubuypkPrice } from "../scrapers/cosmetics/dubuy_pk.js";
import { getMakeupcityshopPrice } from "../scrapers/cosmetics/makeupcityshop.js";
import { getDermapkPrice } from "../scrapers/cosmetics/derma_pk.js";
import { getMedogetPrice } from "../scrapers/cosmetics/medoget.js";
import { getHighfypkPrice } from "../scrapers/cosmetics/highfy_pk.js";
import { getReanapkPrice } from "../scrapers/cosmetics/reana_pk.js";
import { getShadenterprisespkPrice } from "../scrapers/home_appliances/shadenterprisespk.js";

const router = express.Router();

const checkAdminAuth = (req, res, next) => {
  const userEmail = req.headers["user-email"] || req.body.userEmail;

  if (!userEmail) {
    return res.status(401).json({ error: "User email is required" });
  }

  if (userEmail !== "sohail@studio2001.com") {
    return res
      .status(403)
      .json({ error: "Access denied. Admin privileges required." });
  }

  next();
};

router.get("/get-all-products", async (req, res) => {
  const products = await Product.find();
  res.json({ products });
});

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, category, subCategory, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (search) {
      query.$text = { $search: search };
    }

    console.log("Query: ", query);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    console.log("Products: ", products);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      subCategory,
      minRating,
      sortBy = "relevance",
    } = req.query;

    console.log("Subcat", subCategory);

    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    const capitalize = (str) => {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    console.log("Search Query: ", query);

    let sortOptions = {};
    switch (sortBy) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "rating":
        sortOptions = { rating: -1, reviews: -1 };
        break;
      case "reviews":
        sortOptions = { reviews: -1, rating: -1 };
        break;
      case "relevance":
      default:
        if (search) {
          sortOptions = { score: { $meta: "textScore" } };
        } else {
          sortOptions = { createdAt: -1 };
        }
        break;
    }

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: "Failed to search products" });
  }
});

router.get("/test", (req, res) => {
  res.json({ message: "Test successful" });
});

router.post("/price", async (req, res) => {
  try {
    const product = req.body;
    console.log("Product: ", product);

    if (product) {
      const urlArray = new Array(
        product.priceComparison.platformOneUrl,
        product.priceComparison.platformTwoUrl,
        product.priceComparison.platformThreeUrl,
        product.priceComparison.platformFourUrl,
        product.priceComparison.platformFiveUrl,
        product.priceComparison.platformSixUrl
      );
      console.log("URL Array: ", urlArray);
      const pricePromises = [];

      for (const url of urlArray) {
        if (!url) continue;

        try {
          if (product.subCategory.toLowerCase() === "laptops") {
            if (url.includes("priceoye")) {
              pricePromises.push(getPriceoyepkPrice(url));
            } else if (url.includes("eezepc")) {
              pricePromises.push(getEezepcComPrice(url));
            } else if (url.includes("shophive")) {
              pricePromises.push(getShophiveComPrice(url));
            } else {
              pricePromises.push("Unknown domain");
            }
          } else if (
            product.subCategory.toLowerCase() === "smartphones" ||
            product.subCategory.toLowerCase() === "smart watches"
          ) {
            if (url.includes("priceoye")) {
              pricePromises.push(getPriceoyepkPrice(url));
            } else if (url.includes("eezepc")) {
              pricePromises.push(getEezepcComPrice(url));
            } else if (url.includes("shophive")) {
              pricePromises.push(getShophiveComPrice(url));
            } else {
              pricePromises.push("Unknown domain");
            }
          } else if (product.category.toLowerCase() === "cosmetics") {
            if (url.includes("chasevalue")) {
              pricePromises.push(getChasevaluePrice(url));
            } else if (url.includes("just4girls")) {
              pricePromises.push(getJust4girlspkPrice(url));
            } else if (url.includes("makeupstash")) {
              pricePromises.push(getMakeupstashpkPrice(url));
            } else if (url.includes("naheed.pk")) {
              pricePromises.push(getNaheedPrice(url));
            } else if (url.includes("trendify.pk")) {
              pricePromises.push(getTrendifypkPrice(url));
            } else if (url.includes("vegas.pk")) {
              pricePromises.push(getVegaspkPrice(url));
            } else if (url.includes("makeupcityshop")) {
              pricePromises.push(getMakeupcityshopPrice(url));
            } else if (url.includes("dubuypk.com")) {
              pricePromises.push(getDubuypkPrice(url));
            } else if (url.includes("derma.pk")) {
              pricePromises.push(getDermapkPrice(url));
            } else if (url.includes("medoget.com")) {
              pricePromises.push(getMedogetPrice(url));
            } else if (url.includes("highfy.pk")) {
              pricePromises.push(getHighfypkPrice(url));
            } else if (url.includes("reana.pk")) {
              pricePromises.push(getReanapkPrice(url));
            } else {
              pricePromises.push("Unknown domain");
            }
          } else if (product.category.toLowerCase() === "home appliances") {
            if (url.includes("aysonline")) {
              pricePromises.push(getAysonlinePrice(url));
            } else if (url.includes("friendshome")) {
              pricePromises.push(getFriendsHomePrice(url));
            } else if (url.includes("jalalelectronics")) {
              pricePromises.push(getJalalelectronicsPrice(url));
            } else if (url.includes("japanelectronics")) {
              pricePromises.push(getJapanelectronicsPrice(url));
            } else if (url.includes("lahorecentre")) {
              pricePromises.push(getLahorecentrePrice(url));
            } else if (url.includes("sohailelectronics")) {
              pricePromises.push(getSohailelectronicsPrice(url));
            } else {
              pricePromises.push("Unknown domain");
            }
          }
        } catch (error) {
          console.error(`Error processing URL ${url}:`, error);
        }
      }

      const results = await Promise.allSettled(pricePromises);
      const validResults = results
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => result.value);

      if (validResults.length === 0) {
        return res
          .status(500)
          .json({ error: "Failed to fetch any price data" });
      }

      validResults.sort((a, b) => a.price - b.price);

      // const priceData = {};
      // validResults.forEach((result, i) => {
      //   priceData[`store${i + 1}`] = result;
      // });

      console.log("Multi-URL price data: ", validResults);
      return res.json(validResults);
    }

    return res.status(400).json({ error: "URL or URLs parameter is required" });
  } catch (error) {
    console.error("Error fetching price:", error);
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

router.get("/:id/recommendations", async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 8 } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const recommendations = await Product.find({
      _id: { $ne: id },
      $or: [
        { category: product.category },
        { subCategory: product.subCategory },
        { brand: product.brand },
      ],
      isActive: true,
    })
      .sort({ rating: -1, reviews: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      recommendations,
      total: recommendations.length,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post("/", checkAdminAuth, async (req, res) => {
  try {
    const productData = {
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      longDescription: req.body.longDescription,
      images: req.body.images,
      category: req.body.category,
      subCategory: req.body.subCategory,
      brand: req.body.brand,
      priceComparison: req.body.priceComparison,
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/:id", checkAdminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", checkAdminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
