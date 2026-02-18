// src/routes/user/activity.routes.js
import express from "express";
import {
  trackActivity,
  trackBatchActivities,
  getMyJourney,
  getMyStats,
  getUserActivity,
  getActivityAnalytics,
} from "../../controllers/user/activity.controller.js";
import { authenticate, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

// User routes (authenticated)
router.post("/track", authenticate, trackActivity);
router.post("/batch", authenticate, trackBatchActivities);
router.get("/my-journey", authenticate, getMyJourney);
router.get("/my-stats", authenticate, getMyStats);

// Admin routes
router.get("/analytics", authenticate, requireAdmin, getActivityAnalytics);
router.get("/user/:userId", authenticate, requireAdmin, getUserActivity);

export default router;
