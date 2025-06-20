import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Unauthorized - Token expired" });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Unauthorized - Invalid token" });
      }
      return res.status(401).json({ message: "Unauthorized - Token verification failed" });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid token payload" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

// Optional: Rate limiting middleware
export const rateLimitAuth = (req, res, next) => {
  // Simple rate limiting - can be enhanced with Redis
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!req.session) {
    req.session = {};
  }

  if (!req.session.authAttempts) {
    req.session.authAttempts = [];
  }

  // Clean old attempts
  req.session.authAttempts = req.session.authAttempts.filter(
    attempt => now - attempt < windowMs
  );

  if (req.session.authAttempts.length >= maxAttempts) {
    return res.status(429).json({ 
      message: "Too many authentication attempts. Please try again later." 
    });
  }

  req.session.authAttempts.push(now);
  next();
};