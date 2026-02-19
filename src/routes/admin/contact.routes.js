import express from "express";
import {
  getAllContactsController,
  getContactByIdController,
  updateContactController,
  resolveContactController,
  deleteContactController,
  getContactStatsController,
} from "../../controllers/admin/contact.controller.js";
import { authenticate, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate, requireAdmin);

router.get("/", getAllContactsController);
router.get("/stats", getContactStatsController);
router.get("/:id", getContactByIdController);
router.put("/:id", updateContactController);
router.patch("/:id/resolve", resolveContactController);
router.delete("/:id", deleteContactController);

export default router;
