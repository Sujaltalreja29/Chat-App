import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { audioUpload, handleAudioUploadError } from "../middleware/audioUpload.middleware.js";
import { sendVoiceNote, sendGroupVoiceNote } from "../controllers/voiceNote.controller.js";

const router = express.Router();

// Send voice note to user
router.post("/:receiverId", 
  protectRoute, 
  audioUpload.single("audio"), 
  handleAudioUploadError,  // 🆕 Error handling
  sendVoiceNote
);

// Send voice note to group
router.post("/group/:groupId", 
  protectRoute, 
  audioUpload.single("audio"), 
  handleAudioUploadError,  // 🆕 Error handling
  sendGroupVoiceNote
);

export default router;