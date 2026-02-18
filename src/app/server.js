import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./../database/index.js";
import { config } from "./../config/index.js";
import routes from "./../routes/index.js";
import {
  helmetMiddleware,
  mongoSanitizeMiddleware,
  hppMiddleware,
  corsOptions,
  requestLogger,
} from "./../middleware/security.js";
import { errorHandler, notFoundHandler } from "./../middleware/errorHandler.js";

const app = express();

// Security Middleware
app.use(helmetMiddleware);
app.use(cors(corsOptions));
app.use(mongoSanitizeMiddleware);
app.use(hppMiddleware);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Trust proxy (if behind reverse proxy like nginx)
app.set("trust proxy", 1);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      user: "/api/user",
      admin: "/api/admin"
    }
  });
});

// API Routes
app.use("/api", routes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

async function start() {
  try {
    // Connect to database
    await connectDB();

    // Only start the server if not in Vercel environment
    // Vercel handles the server startup automatically
    if (process.env.VERCEL !== "1") {
      const port = config?.app?.port ?? 3000;
      app.listen(port, () => {
        console.log("=================================");
        console.log(`🚀 Server running on port ${port}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`🔗 API: http://localhost:${port}/api`);
        console.log("=================================");
      });
    } else {
      console.log("🚀 Running on Vercel serverless environment");
    }
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Initialize database connection
start();

export default app;
