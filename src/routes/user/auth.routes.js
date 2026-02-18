// src/routes/user/auth.routes.js
import express from "express";
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  changePasswordController,
  forgotPasswordController,
  resetPasswordController,
  verifyEmailController,
  getMeController,
} from "../../controllers/user/auth.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { rateLimitMiddleware } from "../../middleware/rateLimiter.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/register", rateLimitMiddleware, registerController);
router.post("/login", rateLimitMiddleware, loginController);
router.post("/refresh-token", refreshTokenController);
router.post("/forgot-password", rateLimitMiddleware, forgotPasswordController);
router.post("/reset-password", resetPasswordController);
router.post("/verify-email", verifyEmailController);

// PROTECTED ROUTES
router.post("/logout", authenticate, logoutController);
router.post("/change-password", authenticate, changePasswordController);
router.get("/me", authenticate, getMeController);

export default router;
