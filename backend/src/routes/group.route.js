import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload, handleFileUploadError } from "../middleware/fileUpload.middleware.js";
import {
  createGroup,
  getMyGroups,
  getGroupDetails,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  leaveGroup,
  updateMemberRole,
  getGroupMessages,
  getGroupMessagesBefore, // 🔥 NEW
  searchGroups
} from "../controllers/group.controller.js";

const router = express.Router();
// Group CRUD
router.post("/create", protectRoute, upload.single("groupPic"), handleFileUploadError, createGroup);
router.get("/my-groups", protectRoute, getMyGroups);
router.get("/search", protectRoute, searchGroups);
router.get("/:groupId", protectRoute, getGroupDetails);
router.put("/:groupId", protectRoute, upload.single("groupPic"), handleFileUploadError, updateGroup);
router.delete("/:groupId", protectRoute, deleteGroup);

// Member Management
router.post("/:groupId/members", protectRoute, addMember);
router.delete("/:groupId/members/:userId", protectRoute, removeMember);
router.post("/:groupId/leave", protectRoute, leaveGroup);
router.put("/:groupId/members/:userId/role", protectRoute, updateMemberRole);

// Group Messages
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.get("/:groupId/messages/before", protectRoute, getGroupMessagesBefore); // 🔥 NEW

export default router;