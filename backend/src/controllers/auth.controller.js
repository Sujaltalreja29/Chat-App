import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// Input validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateFullName = (fullName) => {
  return fullName && fullName.trim().length >= 2 && fullName.trim().length <= 50;
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Enhanced input validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        message: "All fields are required"
      });
    }

    if (!validateFullName(fullName)) {
      return res.status(400).json({ 
        message: "Full name must be between 2 and 50 characters"
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address"
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        message: "Email already exists"
      });
    }

    // Hash password with higher salt rounds
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await newUser.save();
    
    // Generate token
    generateToken(newUser._id, res);

    // Return user data (excluding password)
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });

  } catch (error) {
    console.error("Error in signup controller:", error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const field = Object.keys(error.errors)[0];
      return res.status(400).json({ 
        message: error.errors[field].message
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "Email already exists"
      });
    }
    
    res.status(500).json({ message: "Failed to create account. Please try again." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required"
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address"
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid email or password"
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        message: "Invalid email or password"
      });
    }

    // Generate token
    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });

  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Failed to login. Please try again." });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { 
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error);
    res.status(500).json({ message: "Failed to logout. Please try again." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ 
        message: "Profile picture is required"
      });
    }

    // Validate base64 image format
    if (!profilePic.startsWith('data:image/')) {
      return res.status(400).json({ 
        message: "Invalid image format"
      });
    }

    // Upload to Cloudinary with error handling
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "profile-pics",
      transformation: [
        { width: 400, height: 400, crop: "fill" },
        { quality: "auto:good" }
      ]
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);

  } catch (error) {
    console.error("Error in updateProfile:", error);
    
    if (error.message && error.message.includes('Invalid image')) {
      return res.status(400).json({ 
        message: "Invalid image format or corrupted image"
      });
    }
    
    res.status(500).json({ message: "Failed to update profile. Please try again." });
  }
};

export const checkAuth = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller:", error);
    res.status(500).json({ message: "Authentication check failed" });
  }
};