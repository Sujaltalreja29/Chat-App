import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";
import { 
  getAudioMetadata, 
  validateWaveform, 
  cleanupAudioFile 
} from "../lib/audioProcessor.js";
import mongoose from "mongoose";

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to validate duration
const validateDuration = (duration) => {
  const audioDuration = parseInt(duration);
  return !isNaN(audioDuration) && audioDuration > 0 && audioDuration <= 300; // Max 5 minutes
};

export const sendVoiceNote = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;
    const audioFile = req.file;
    const { duration, waveform } = req.body;

    // Validate inputs
    if (!audioFile) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    if (!isValidObjectId(receiverId)) {
      await cleanupAudioFile(audioFile.path);
      return res.status(400).json({ error: "Invalid receiver ID" });
    }

    if (receiverId === senderId.toString()) {
      await cleanupAudioFile(audioFile.path);
      return res.status(400).json({ error: "Cannot send voice note to yourself" });
    }

    // Validate receiver exists and is a friend
    const [receiver, sender] = await Promise.all([
      User.findById(receiverId),
      User.findById(senderId)
    ]);

    if (!receiver) {
      await cleanupAudioFile(audioFile.path);
      return res.status(404).json({ error: "Receiver not found" });
    }

    if (!sender) {
      await cleanupAudioFile(audioFile.path);
      return res.status(404).json({ error: "Sender not found" });
    }

    // Check if they are friends
    if (!sender.friends.includes(receiverId)) {
      await cleanupAudioFile(audioFile.path);
      return res.status(403).json({ error: "Can only send voice notes to friends" });
    }

    // Validate duration
    if (!duration || !validateDuration(duration)) {
      await cleanupAudioFile(audioFile.path);
      return res.status(400).json({ error: "Invalid duration. Voice note must be between 1 second and 5 minutes" });
    }

    // Get audio metadata
    const audioMetadata = await getAudioMetadata(audioFile.path);
    if (!audioMetadata || !audioMetadata.isValid) {
      await cleanupAudioFile(audioFile.path);
      return res.status(400).json({ error: "Invalid or corrupted audio file" });
    }

    // Validate waveform data
    let waveformData = [];
    if (waveform) {
      try {
        waveformData = typeof waveform === 'string' ? JSON.parse(waveform) : waveform;
        if (!validateWaveform(waveformData)) {
          waveformData = [];
        }
      } catch (error) {
        console.warn("Invalid waveform data:", error.message);
        waveformData = [];
      }
    }

    // Upload to Cloudinary with error handling
    let uploadResponse;
    try {
      uploadResponse = await cloudinary.uploader.upload(audioFile.path, {
        resource_type: "video",
        folder: "chat_voice_notes",
        format: "mp3",
        audio_codec: "mp3",
        bit_rate: "128k",
        quality: "auto",
        transformation: [
          { audio_codec: "mp3", bit_rate: "128k" }
        ]
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      await cleanupAudioFile(audioFile.path);
      return res.status(500).json({ error: "Failed to upload voice note" });
    }

    // Create message
    const newMessage = new Message({
      senderId,
      receiverId,
      messageType: "direct",
      messageSubType: "voice",
      file: {
        url: uploadResponse.secure_url,
        originalName: audioFile.originalname,
        fileName: audioFile.filename,
        fileSize: audioFile.size,
        mimeType: audioFile.mimetype,
        fileType: "voice",
        duration: parseInt(duration),
        waveform: waveformData,
        isCompressed: true
      }
    });

    await newMessage.save();

    // Populate sender info for real-time delivery
    await newMessage.populate("senderId", "fullName profilePic");

    // Clean up temporary file
    await cleanupAudioFile(audioFile.path);

    // Real-time delivery
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);

  } catch (error) {
    console.error("Error in sendVoiceNote controller:", error);
    
    if (req.file) {
      await cleanupAudioFile(req.file.path);
    }
    
    res.status(500).json({ error: "Failed to send voice note. Please try again." });
  }
};

export const sendGroupVoiceNote = async (req, res) => {
  try {
    const { groupId } = req.params;
    const senderId = req.user._id;
    const audioFile = req.file;
    const { duration, waveform } = req.body;

    // Validate inputs
    if (!audioFile) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    if (!isValidObjectId(groupId)) {
      await cleanupAudioFile(audioFile.path);
      return res.status(400).json({ error: "Invalid group ID" });
    }

    // Validate group exists and user is member
    const group = await Group.findById(groupId);
    if (!group) {
      await cleanupAudioFile(audioFile.path);
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some(member => 
      member.user.toString() === senderId.toString()
    );
    
    if (!isMember) {
      await cleanupAudioFile(audioFile.path);
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    // Validate duration
    if (!duration || !validateDuration(duration)) {
      await cleanupAudioFile(audioFile.path);
      return res.status(400).json({ error: "Invalid duration. Voice note must be between 1 second and 5 minutes" });
    }

    // Validate audio file
    const audioMetadata = await getAudioMetadata(audioFile.path);
    if (!audioMetadata || !audioMetadata.isValid) {
      await cleanupAudioFile(audioFile.path);
      return res.status(400).json({ error: "Invalid or corrupted audio file" });
    }

    // Process waveform
    let waveformData = [];
    if (waveform) {
      try {
        waveformData = typeof waveform === 'string' ? JSON.parse(waveform) : waveform;
        if (!validateWaveform(waveformData)) {
          waveformData = [];
        }
      } catch (error) {
        console.warn("Invalid waveform data:", error.message);
        waveformData = [];
      }
    }

    // Upload to Cloudinary with error handling
    let uploadResponse;
    try {
      uploadResponse = await cloudinary.uploader.upload(audioFile.path, {
        resource_type: "video",
        folder: "chat_voice_notes",
        format: "mp3",
        audio_codec: "mp3",
        bit_rate: "128k",
        quality: "auto",
        transformation: [
          { audio_codec: "mp3", bit_rate: "128k" }
        ]
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      await cleanupAudioFile(audioFile.path);
      return res.status(500).json({ error: "Failed to upload voice note" });
    }

    // Create message
    const newMessage = new Message({
      senderId,
      groupId,
      messageType: "group",
      messageSubType: "voice",
      file: {
        url: uploadResponse.secure_url,
        originalName: audioFile.originalname,
        fileName: audioFile.filename,
        fileSize: audioFile.size,
        mimeType: audioFile.mimetype,
        fileType: "voice",
        duration: parseInt(duration),
        waveform: waveformData,
        isCompressed: true
      }
    });

    await newMessage.save();
    
    // Populate sender info
    await newMessage.populate("senderId", "fullName profilePic");

    // Update group's last activity
    group.lastActivity = new Date();
    await group.save();

    // Clean up temporary file
    await cleanupAudioFile(audioFile.path);

    // Real-time delivery to all group members
    group.members.forEach(member => {
      if (member.user.toString() !== senderId.toString()) {
        const memberSocketId = getReceiverSocketId(member.user.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("newGroupMessage", newMessage);
        }
      }
    });

    res.status(201).json(newMessage);

  } catch (error) {
    console.error("Error in sendGroupVoiceNote controller:", error);
    
    if (req.file) {
      await cleanupAudioFile(req.file.path);
    }
    
    res.status(500).json({ error: "Failed to send group voice note. Please try again." });
  }
};