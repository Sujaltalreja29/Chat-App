import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Store online users and typing states
const userSocketMap = {}; // {userId: socketId}
const typingUsers = new Map(); // {chatId: Set of typing users}

// 🔥 NEW: Helper function to get typing users for a chat
const getTypingUsers = (chatId, excludeUserId = null) => {
  const users = typingUsers.get(chatId) || new Set();
  if (excludeUserId) {
    const filtered = new Set(users);
    filtered.delete(excludeUserId);
    return Array.from(filtered);
  }
  return Array.from(users);
};

// 🔥 NEW: Helper function to clean up typing state
const cleanupTyping = (userId) => {
  typingUsers.forEach((users, chatId) => {
    if (users.has(userId)) {
      users.delete(userId);
      // Emit updated typing status to chat participants
      emitTypingUpdate(chatId, userId);
      
      // Clean up empty sets
      if (users.size === 0) {
        typingUsers.delete(chatId);
      }
    }
  });
};

// 🔥 NEW: Helper function to emit typing updates
const emitTypingUpdate = (chatId, excludeUserId = null) => {
  const currentTyping = getTypingUsers(chatId, excludeUserId);
  const [chatType, targetId] = chatId.split(':');
  
  if (chatType === 'direct') {
    // For direct chats, send to both participants
    const [user1Id, user2Id] = targetId.split('-').sort();
    
    [user1Id, user2Id].forEach(userId => {
      if (userId !== excludeUserId) {
        const socketId = getReceiverSocketId(userId);
        if (socketId) {
          const typingForThisUser = currentTyping.filter(u => u !== userId);
          io.to(socketId).emit("typingUpdate", {
            chatId,
            chatType: 'direct',
            typingUsers: typingForThisUser
          });
        }
      }
    });
  } else if (chatType === 'group') {
    // For group chats, send to all group members
    // We'll need to get group members from database
    io.to(`group:${targetId}`).emit("typingUpdate", {
      chatId,
      chatType: 'group', 
      groupId: targetId,
      typingUsers: currentTyping
    });
  }
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    
    // 🔥 NEW: Join user to their groups for group typing
    // We'll implement this when handling group joining
  }

  // Test connection
  socket.on("test", (data) => {
    console.log("Test received from client:", data);
    socket.emit("test-response", "Socket working!");
  });

  // 🔥 NEW: Typing indicators
  socket.on("typing", ({ chatId, chatType, isTyping, userInfo }) => {
    console.log(`👀 User ${userInfo?.fullName} ${isTyping ? 'started' : 'stopped'} typing in ${chatType} chat: ${chatId}`);
    
    if (!typingUsers.has(chatId)) {
      typingUsers.set(chatId, new Set());
    }
    
    const chatTypingUsers = typingUsers.get(chatId);
    
    if (isTyping) {
      chatTypingUsers.add(userInfo);
    } else {
      // Remove user (by userId comparison)
      chatTypingUsers.forEach(user => {
        if (user.userId === userInfo.userId) {
          chatTypingUsers.delete(user);
        }
      });
    }
    
    // Emit to other chat participants
    emitTypingUpdate(chatId, userInfo.userId);
  });

  // 🔥 NEW: Join group rooms for typing indicators
  socket.on("joinGroup", ({ groupId }) => {
    socket.join(`group:${groupId}`);
    console.log(`👥 User ${userId} joined group room: ${groupId}`);
  });

  // 🔥 NEW: Leave group rooms
  socket.on("leaveGroup", ({ groupId }) => {
    socket.leave(`group:${groupId}`);
    console.log(`👥 User ${userId} left group room: ${groupId}`);
  });

  // Emit online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    
    // Clean up typing state for disconnected user
    if (userId) {
      cleanupTyping(userId);
    }
    
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };