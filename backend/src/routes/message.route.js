import express from "express";
import multer from "multer";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getMessages, 
  getUsersForSidebar, 
  getGroupsForSidebar,
  sendMessage,
  sendGroupMessage,
    getUnreadCounts,           // 🔥 NEW
  markDirectMessagesAsRead,  // 🔥 NEW
  markGroupMessagesAsRead    // 🔥 NEW
} from "../controllers/message.controller.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute,upload.single("image"), sendMessage);
router.get("/groups/sidebar", protectRoute, getGroupsForSidebar);
router.post("/send-group/:groupId", protectRoute, upload.single("image"), sendGroupMessage);

router.get("/unread-counts", protectRoute, getUnreadCounts);
router.post("/mark-read/direct/:senderId", protectRoute, markDirectMessagesAsRead);
router.post("/mark-read/group/:groupId", protectRoute, markGroupMessagesAsRead);

export default router;
