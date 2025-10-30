import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import productsRoutes from "./routes/products.js";
import usersRoutes from "./routes/users.js";
// import deleteAllProductsRoutes from "./routes/deleteAllProducts.js";
import reviewsRoutes from "./routes/reviews.js";
import wishlistRoutes from "./routes/wishlist.js";
import priceAlertRoutes from "./routes/priceAlert.js";
import cronRoutes from "./routes/cron.js";
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
// app.use("/api/deleteAllProducts", deleteAllProductsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/price-alerts", priceAlertRoutes);
app.use("/api/cron", cronRoutes);

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server is running smoothly on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });
