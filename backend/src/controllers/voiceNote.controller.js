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

export const sendVoiceNote = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;
    const audioFile = req.file;
    
    const { duration, waveform } = req.body;

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      await cleanupAudioFile(audioFile.path);
      return res.status(404).json({ error: "Receiver not found" });
    }

    // Get audio metadata
    const audioMetadata = await getAudioMetadata(audioFile.path);
    if (!audioMetadata || !audioMetadata.isValid) {
      await cleanupAudioFile(audioFile.path);
      return res.status(400).json({ error: "Invalid audio file" });
    }

    // Validate duration
    const audioDuration = parseInt(duration) || 0;
    if (audioDuration > 300) {
      await cleanupAudioFile(audioFile.path);
      return res.status(400).json({ error: "Voice note too long (max 5 minutes)" });
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
        waveformData = [];
      }
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
      folder: "chat_voice_notes",
      format: "mp3",
      audio_codec: "mp3",
      bit_rate: "128k",
      quality: "auto"
    });

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
        duration: audioDuration,
        waveform: waveformData,
        isCompressed: true
      }
    });

    await newMessage.save();

    // 🔧 CRITICAL: Populate sender info for real-time delivery
    await newMessage.populate("senderId", "fullName profilePic");

    // Clean up temporary file
    await cleanupAudioFile(audioFile.path);

    // 🔧 FIXED: Real-time delivery with proper event name
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      console.log(`📤 Sending voice note to receiver ${receiverId} via socket ${receiverSocketId}`);
      io.to(receiverSocketId).emit("newMessage", newMessage); // Use "newMessage" not "newVoiceNote"
    }

    // 🔧 ALSO: Send to sender if they have multiple devices
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendVoiceNote controller: ", error.message);
    
    if (req.file) {
      await cleanupAudioFile(req.file.path);
    }
    
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupVoiceNote = async (req, res) => {
  try {
    const { groupId } = req.params;
    const senderId = req.user._id;
    const audioFile = req.file;
    const { duration, waveform } = req.body;

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file provided" });
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

    // Validate audio file
    const audioMetadata = await getAudioMetadata(audioFile.path);
    if (!audioMetadata || !audioMetadata.isValid) {
      await cleanupAudioFile(audioFile.path);
      return res.status(400).json({ error: "Invalid audio file" });
    }

    // Validate duration
    const audioDuration = parseInt(duration) || 0;
    if (audioDuration > 300) {
      await cleanupAudioFile(audioFile.path);
      return res.status(400).json({ error: "Voice note too long (max 5 minutes)" });
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
        waveformData = [];
      }
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
      folder: "chat_voice_notes",
      format: "mp3",
      audio_codec: "mp3",
      bit_rate: "128k",
      quality: "auto"
    });

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
        duration: audioDuration,
        waveform: waveformData,
        isCompressed: true
      }
    });

    await newMessage.save();
    
    // 🔧 CRITICAL: Populate sender info
    await newMessage.populate("senderId", "fullName profilePic");

    // Clean up temporary file
    await cleanupAudioFile(audioFile.path);

    // 🔧 FIXED: Emit to all group members with proper event name
    console.log(`📤 Sending group voice note to group ${groupId}`);
    io.to(groupId.toString()).emit("newGroupMessage", newMessage); // Use "newGroupMessage"

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendGroupVoiceNote controller: ", error.message);
    
    if (req.file) {
      await cleanupAudioFile(req.file.path);
    }
    
    res.status(500).json({ error: "Internal server error" });
  }
};