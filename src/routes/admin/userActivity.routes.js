// src/routes/admin/userActivity.routes.js
import express from "express";
import {
  getAdminUserActivities,
  getAdminUserActivityStats,
  getAdminUsersActivityList,
  getAdminUserActivityDetail,
  getAdminUserActivitiesDetail,
  getAdminUserSessions,
} from "../../controllers/admin/userActivity.controller.js";
import { authenticate, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

// GET /api/admin/user-activities/users-list  – one row per user with aggregated stats
router.get(
  "/users-list",
  authenticate,
  requireAdmin,
  getAdminUsersActivityList,
);

// GET /api/admin/user-activities/user/:userId – full detail for one user
router.get(
  "/user/:userId",
  authenticate,
  requireAdmin,
  getAdminUserActivityDetail,
);

// GET /api/admin/user-activities/activities/:userId – detailed activities with filters
router.get(
  "/activities/:userId",
  authenticate,
  requireAdmin,
  getAdminUserActivitiesDetail,
);

// GET /api/admin/user-activities/sessions/:userId – session tracking data
router.get(
  "/sessions/:userId",
  authenticate,
  requireAdmin,
  getAdminUserSessions,
);

// GET /api/admin/user-activities             – raw activity feed
router.get("/", authenticate, requireAdmin, getAdminUserActivities);

// GET /api/admin/user-activities/stats
router.get("/stats", authenticate, requireAdmin, getAdminUserActivityStats);

export default router;
