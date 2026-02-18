// src/routes/user/contact.routes.js
import express from "express";
import { submitContactController } from "../../controllers/user/contact.controller.js";
import { rateLimitMiddleware } from "../../middleware/rateLimiter.js";

const router = express.Router();

// PUBLIC ROUTE - Submit contact form
router.post("/", rateLimitMiddleware, submitContactController);

export default router;
