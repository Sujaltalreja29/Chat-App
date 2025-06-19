// routes/call.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getActiveCalls,
  createCallRecord,
  endCallRecord,
  checkUserAvailability
} from "../controllers/call.controller.js";

const router = express.Router();

// All call routes require authentication
router.use(protectRoute);

// Get active calls for current user
router.get("/active", getActiveCalls);

// Create call record
router.post("/initiate", createCallRecord);

// End call record
router.put("/end/:callId", endCallRecord);

// Check if user is available for calls
router.get("/availability/:userId", checkUserAvailability);

export default router;