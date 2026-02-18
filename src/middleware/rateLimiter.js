// src/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";
import { config } from "../config/index.js";

/**
 * General rate limiter for authentication routes
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: config.security.rateLimitWindowMs || 15 * 60 * 1000, // 15 minutes
  max: config.security.rateLimitMax || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for certain IPs if needed
    const trustedIPs = process.env.TRUSTED_IPS?.split(",") || [];
    return trustedIPs.includes(req.ip);
  },
});

/**
 * Strict rate limiter for login attempts (prevent brute force)
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Moderate rate limiter for password reset requests
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: "Too many password reset requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
