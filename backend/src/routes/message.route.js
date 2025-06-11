import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/fileUpload.middleware.js";
import { compressImage } from "../middleware/imageCompression.middleware.js";
import { 
  getMessages, 
  getMessagesBefore, // 🔥 NEW
  getUsersForSidebar, 
  getGroupsForSidebar,
  sendMessage,
  sendGroupMessage,
  getUnreadCounts,
  markDirectMessagesAsRead,
  markGroupMessagesAsRead
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.get("/:id/before", protectRoute, getMessagesBefore); // 🔥 NEW: Infinite scroll

router.post("/send/:id", protectRoute, upload.single("file"), compressImage, sendMessage);
router.get("/groups/sidebar", protectRoute, getGroupsForSidebar);
router.post("/send-group/:groupId", protectRoute, upload.single("file"), compressImage, sendGroupMessage);

router.get("/unread-counts", protectRoute, getUnreadCounts);
router.post("/mark-read/direct/:senderId", protectRoute, markDirectMessagesAsRead);
router.post("/mark-read/group/:groupId", protectRoute, markGroupMessagesAsRead);

export default router;