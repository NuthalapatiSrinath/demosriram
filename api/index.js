import app from "../src/app/app.js";
import { connectDB } from "../src/database/index.js";

// Serverless handler that ensures DB connection
export default async function handler(req, res) {
  try {
    // Ensure database is connected before handling request
    await connectDB();

    // Let Express handle the request
    return app(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
