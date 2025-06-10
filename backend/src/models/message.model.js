// models/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // For direct messages
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function() {
        return !this.groupId; // Required only if not a group message
      }
    },
    // For group messages
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: function() {
        return !this.receiverId; // Required only if not a direct message
      }
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    messageType: {
      type: String,
      enum: ['direct', 'group'],
      required: true
    },
    // For group message features
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },
    editedAt: {
      type: Date
    },
    deletedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Indexes for better performance
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ messageType: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;