// routes/search.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  searchGlobalMessages,
  searchInConversation,
  getRecentSearches,
  searchChats
} from "../controllers/search.controller.js";

const router = express.Router();

// 🔍 Global message search
router.get("/messages", protectRoute, searchGlobalMessages);

// 🔍 Search within specific conversation
router.get("/conversation/:id", protectRoute, searchInConversation);

// 🔍 Search chats (users and groups)
router.get("/chats", protectRoute, searchChats);

// 🔍 Get recent searches
router.get("/recent", protectRoute, getRecentSearches);

export default router;