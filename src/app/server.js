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

    const port = config?.app?.port ?? 3000;
    app.listen(port, () => {
      console.log("=================================");
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API: http://localhost:${port}/api`);
      console.log("=================================");
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();

export default app;
