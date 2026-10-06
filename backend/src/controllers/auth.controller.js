// controllers/auth.controller.js - With Google Auth
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { OAuth2Client } from 'google-auth-library';

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// 🆕 Helper function to verify Google token
const verifyGoogleToken = async (credential) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      fullName: payload.name,
      profilePic: payload.picture,
      emailVerified: payload.email_verified
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw new Error('Invalid Google token');
  }
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

// 🆕 Google Signup
export const googleSignup = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ 
        message: "Google credential is required" 
      });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(credential);

    if (!googleUser.emailVerified) {
      return res.status(400).json({ 
        message: "Please use a verified Google email address" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: googleUser.email.toLowerCase() },
        { googleId: googleUser.googleId }
      ]
    });

    if (existingUser) {
      return res.status(409).json({ 
        message: "Account already exists. Please sign in instead." 
      });
    }

    // Create new user with Google data
    const newUser = new User({
      fullName: googleUser.fullName,
      email: googleUser.email.toLowerCase(),
      profilePic: googleUser.profilePic,
      googleId: googleUser.googleId,
      isGoogleUser: true,
      // Google users don't need a password
      password: undefined
    });

    await newUser.save();

    // Generate token
    generateToken(newUser._id, res);

    // Return user data
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      isGoogleUser: true
    });

  } catch (error) {
    console.error("Error in Google signup:", error);
    
    if (error.message === 'Invalid Google token') {
      return res.status(400).json({ 
        message: "Invalid Google authentication. Please try again." 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to create account with Google. Please try again." 
    });
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

    // Check if user is a Google user
    if (user.isGoogleUser) {
      return res.status(400).json({ 
        message: "This account uses Google sign-in. Please use Google to log in." 
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

export const demoLogin = async (req, res) => {
  try {
    const { account } = req.body || {};
    const demoEmail = "demo@chatty.app";
    const demoPassword = "chatty-demo-account";
    const companionEmail = "alex@chatty.app";
    const hashedPassword = await bcrypt.hash(demoPassword, 12);

    const demoUser = await User.findOneAndUpdate(
      { email: demoEmail },
      {
        $setOnInsert: {
          email: demoEmail,
          fullName: "Chatty Demo",
          password: hashedPassword,
          profilePic: "https://randomuser.me/api/portraits/lego/1.jpg",
          isGoogleUser: false,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const companionUser = await User.findOneAndUpdate(
      { email: companionEmail },
      {
        $setOnInsert: {
          email: companionEmail,
          fullName: "Alex Morgan",
          password: hashedPassword,
          profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
          isGoogleUser: false,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await Promise.all([
      User.updateOne(
        { _id: demoUser._id },
        { $addToSet: { friends: companionUser._id } }
      ),
      User.updateOne(
        { _id: companionUser._id },
        { $addToSet: { friends: demoUser._id } }
      ),
    ]);

    const existingConversation = await Message.exists({
      messageType: "direct",
      $or: [
        { senderId: demoUser._id, receiverId: companionUser._id },
        { senderId: companionUser._id, receiverId: demoUser._id },
      ],
    });

    if (!existingConversation) {
      await Message.create({
        senderId: companionUser._id,
        receiverId: demoUser._id,
        text: "Welcome to the Chatty demo! Send me a message to try it out.",
        messageType: "direct",
        messageSubType: "text",
        isRead: false,
      });
    }

    const loginUser = account === "companion" ? companionUser : demoUser;
    generateToken(loginUser._id, res);

    res.status(200).json({
      _id: loginUser._id,
      fullName: loginUser.fullName,
      email: loginUser.email,
      profilePic: loginUser.profilePic,
    });
  } catch (error) {
    console.error("Error in demo login:", error);
    res.status(500).json({ message: "Demo login is temporarily unavailable." });
  }
};

export const resetDemo = async (req, res) => {
  try {
    const demoUser = await User.findOne({ email: "demo@chatty.app" });
    const companionUser = await User.findOne({ email: "alex@chatty.app" });

    if (!demoUser || !companionUser) {
      return res.status(404).json({ message: "Demo accounts are not available yet." });
    }

    await Promise.all([
      User.updateOne(
        { _id: demoUser._id },
        { $set: { friends: [companionUser._id], friendRequests: { sent: [], received: [] } } }
      ),
      User.updateOne(
        { _id: companionUser._id },
        { $set: { friends: [demoUser._id], friendRequests: { sent: [], received: [] } } }
      ),
      Message.deleteMany({
        messageType: "direct",
        $or: [
          { senderId: demoUser._id, receiverId: companionUser._id },
          { senderId: companionUser._id, receiverId: demoUser._id },
        ],
      }),
    ]);

    await Message.create({
      senderId: companionUser._id,
      receiverId: demoUser._id,
      text: "Welcome to the Chatty demo! Send me a message to try it out.",
      messageType: "direct",
      messageSubType: "text",
      isRead: false,
    });

    res.status(200).json({ message: "Demo reset successfully" });
  } catch (error) {
    console.error("Error resetting demo:", error);
    res.status(500).json({ message: "Could not reset the demo." });
  }
};

// 🆕 Google Login
export const googleLogin = async (req, res) => {
  console.log("GOOGLE LOGIN ROUTE HIT");
  try {
    const { credential } = req.body;
    console.log(req.body);
    if (!credential) {
      return res.status(400).json({ 
        message: "Google credential is required" 
      });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(credential);

    // Find existing user
    const existingUser = await User.findOne({ 
      $or: [
        { email: googleUser.email.toLowerCase() },
        { googleId: googleUser.googleId }
      ]
    });

    if (!existingUser) {
      return res.status(404).json({ 
        message: "No account found. Please sign up first." 
      });
    }

    // Update user with Google ID if not present
    if (!existingUser.googleId) {
      existingUser.googleId = googleUser.googleId;
      existingUser.isGoogleUser = true;
      await existingUser.save();
    }

    // Generate token
    generateToken(existingUser._id, res);

    res.status(200).json({
      _id: existingUser._id,
      fullName: existingUser.fullName,
      email: existingUser.email,
      profilePic: existingUser.profilePic,
      isGoogleUser: existingUser.isGoogleUser
    });

  } catch (error) {
    console.error("Error in Google login:", error);
    
    if (error.message === 'Invalid Google token') {
      return res.status(400).json({ 
        message: "Invalid Google authentication. Please try again." 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to login with Google. Please try again." 
    });
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