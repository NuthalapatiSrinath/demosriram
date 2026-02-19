// src/middleware/auth.js
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

/**
 * Authenticate middleware - Verify JWT access token
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    console.log("❌ Auth middleware: No Bearer token in header");
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
  }

  const token = authHeader.split(" ")[1];
  console.log(
    `🔍 Auth middleware: Verifying token (first 20 chars): ${token.substring(0, 20)}...`,
  );

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    console.log(
      `✅ Auth middleware: Token valid for user ${payload.sub} (${payload.email})`,
    );
    req.user = payload; // { sub: userId, role: 'user'/'admin', email: '...' }
    return next();
  } catch (err) {
    console.log(
      `❌ Auth middleware: Token verification failed - ${err.name}: ${err.message}`,
    );
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

/**
 * Require Admin middleware - Check if user has admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  // Allow superadmin, admin, centeradmin, and staff
  const allowedRoles = ["superadmin", "admin", "centeradmin", "staff"];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied - Admin privileges required",
    });
  }

  return next();
};

/**
 * Optional Authentication - Adds user to req if token is valid, but doesn't fail if missing
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(); // No token provided, continue without user
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    req.user = payload;
  } catch (err) {
    // Invalid token, but continue without user
    console.log("Optional auth - invalid token:", err.message);
  }

  return next();
};
