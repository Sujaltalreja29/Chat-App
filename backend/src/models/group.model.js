// models/group.model.js
import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200
    },
    groupPic: {
      type: String,
      default: ""
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    settings: {
      isPrivate: {
        type: Boolean,
        default: false
      },
      allowMemberInvite: {
        type: Boolean,
        default: true
      },
      maxMembers: {
        type: Number,
        default: 100,
        max: 500
      }
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Indexes for better performance
groupSchema.index({ 'members.user': 1 });
groupSchema.index({ createdBy: 1 });
groupSchema.index({ name: 'text', description: 'text' });

const Group = mongoose.model("Group", groupSchema);

export default Group;