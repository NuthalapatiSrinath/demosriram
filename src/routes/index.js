// src/routes/index.js
import express from "express";
import userRoutes from "./user/index.js";
import adminRoutes from "./admin/index.js";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/admin", adminRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
