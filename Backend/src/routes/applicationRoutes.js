import express from "express";
import {
  createApplication,
  getMyApplication,
  updateApplication,
  getAllApplications,
  updateStatus,
  getApplicationById,
} from "../controllers/applicationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createApplication);

// Faculty specific
router.get("/my/:id", getMyApplication); // ✅ FIXED PATH

router.put("/:id", updateApplication);

// ADMIN ROUTES
router.get("/", authMiddleware, getAllApplications);
router.put("/status/:id", authMiddleware, updateStatus);

// 🔥 IMPORTANT: KEEP THIS LAST
router.get("/:id", getApplicationById);

export default router;