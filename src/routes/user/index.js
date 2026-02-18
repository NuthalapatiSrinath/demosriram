// src/routes/user/index.js
import express from "express";
import authRoutes from "./auth.routes.js";
import contactRoutes from "./contact.routes.js";
import activityRoutes from "./activity.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/contact", contactRoutes);
router.use("/activity", activityRoutes);

export default router;
