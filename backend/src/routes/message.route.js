import express from "express";
import multer from "multer";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getMessages, 
  getUsersForSidebar, 
  getGroupsForSidebar,
  sendMessage,
  sendGroupMessage 
} from "../controllers/message.controller.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute,upload.single("image"), sendMessage);
router.get("/groups/sidebar", protectRoute, getGroupsForSidebar);
router.post("/send-group/:groupId", protectRoute, upload.single("image"), sendGroupMessage);

export default router;
