import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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

// Trust proxy (important for Vercel)
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
      admin: "/api/admin",
    },
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api", routes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;