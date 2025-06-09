// routes/friend.routes.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  getPendingRequests,
  removeFriend,
  cancelFriendRequest
} from "../controllers/friend.controller.js";

const router = express.Router();

// Search users (for sending friend requests)
router.get("/search", protectRoute, searchUsers);

// Friend request management
router.post("/request/:userId", protectRoute, sendFriendRequest);
router.post("/accept/:requestId", protectRoute, acceptFriendRequest);
router.post("/decline/:requestId", protectRoute, declineFriendRequest);
router.delete("/cancel/:userId", protectRoute, cancelFriendRequest);

// Friend management
router.get("/", protectRoute, getFriends);
router.get("/requests", protectRoute, getPendingRequests);
router.delete("/:friendId", protectRoute, removeFriend);

export default router;