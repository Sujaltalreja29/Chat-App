// routes/auth.route.js - With Google Auth
import express from "express";
import { 
  checkAuth, 
  demoLogin,
  resetDemo,
  login, 
  logout, 
  signup, 
  updateProfile,
  googleSignup,
  googleLogin
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Regular auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/demo-login", demoLogin);
router.post("/demo-reset", resetDemo);
router.post("/logout", logout);

// 🆕 Google auth routes
router.post("/google-signup", googleSignup);
router.post("/google-login", googleLogin);

// Protected routes
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

export default router;