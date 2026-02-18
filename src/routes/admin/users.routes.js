// src/routes/admin/users.routes.js
import express from "express";
import {
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
  getUserStatsController,
} from "../../controllers/admin/users.controller.js";
import { authenticate, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

// All routes are protected and require admin role
router.use(authenticate, requireAdmin);

router.get("/", getAllUsersController);
router.get("/stats", getUserStatsController);
router.get("/:id", getUserByIdController);
router.put("/:id", updateUserController);
router.delete("/:id", deleteUserController);

export default router;
