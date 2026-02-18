// src/routes/admin/index.js
import express from "express";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import contactRoutes from "./contact.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/contacts", contactRoutes);

export default router;
