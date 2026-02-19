import mongoose from "mongoose";
import { config } from "../config/index.js";

// Cache the database connection for serverless
let cachedConnection = null;

export const connectDB = async () => {
  // If already connected, reuse the connection
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("♻️  Using cached database connection");
    return cachedConnection;
  }

  try {
    // Configure Mongoose for serverless
    mongoose.set("strictQuery", false);

    const connection = await mongoose.connect(config.db.url, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    cachedConnection = connection;
    console.log("✅ DB connected successfully");
    return connection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};
