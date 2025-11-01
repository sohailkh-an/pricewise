import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import productsRoutes from "./routes/products.js";
import usersRoutes from "./routes/users.js";
import reviewsRoutes from "./routes/reviews.js";
import wishlistRoutes from "./routes/wishlist.js";
import priceAlertRoutes from "./routes/priceAlert.js";
import cronRoutes from "./routes/cron.js";
import recommendationRoutes from "./routes/recommendations.js";
import Review from "./models/Review.js";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/products", productsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/price-alerts", priceAlertRoutes);
app.use("/api/cron", cronRoutes);

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("MongoDB connected");

    try {
      const indexes = await Review.collection.getIndexes();
      if (indexes.product_1_userEmail_1) {
        await Review.collection.dropIndex("product_1_userEmail_1");
        console.log("Dropped old index: product_1_userEmail_1");
      }
    } catch (error) {
      if (error.code !== 27 && error.code !== 26) {
        console.log("Index cleanup:", error.message);
      }
    }

    app.listen(PORT, () => {
      console.log(`Server is running smoothly on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });
