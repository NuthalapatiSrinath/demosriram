// src/routes/admin/auth.routes.js
import express from "express";
import {
  adminLoginController,
  adminLogoutController,
  getAdminMeController,
  createAdminController,
} from "../../controllers/admin/auth.controller.js";
import {
  changePasswordController,
  forgotPasswordController,
  resetPasswordController,
} from "../../controllers/user/auth.controller.js";
import { authenticate, requireAdmin } from "../../middleware/auth.js";
import { rateLimitMiddleware } from "../../middleware/rateLimiter.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/login", rateLimitMiddleware, adminLoginController);
router.post("/forgot-password", rateLimitMiddleware, forgotPasswordController);
router.post("/reset-password", resetPasswordController);

// PROTECTED ADMIN ROUTES
router.post("/logout", authenticate, requireAdmin, adminLogoutController);
router.get("/me", authenticate, requireAdmin, getAdminMeController);
router.post("/create-admin", authenticate, requireAdmin, createAdminController);
router.post(
  "/change-password",
  authenticate,
  requireAdmin,
  changePasswordController,
);

export default router;
