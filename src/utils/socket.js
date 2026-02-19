// src/utils/socket.js
import { Server } from "socket.io";

let io = null;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for Vercel deployment
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Join room for specific user activity tracking
    socket.on("join-user-activity", (userId) => {
      socket.join(`user-activity-${userId}`);
      console.log(`👤 Socket ${socket.id} joined user-activity-${userId}`);
    });

    // Join room for admin analytics page (all activities)
    socket.on("join-admin-analytics", () => {
      socket.join("admin-analytics");
      console.log(`📊 Socket ${socket.id} joined admin-analytics`);
    });

    // Leave room
    socket.on("leave-user-activity", (userId) => {
      socket.leave(`user-activity-${userId}`);
      console.log(`👋 Socket ${socket.id} left user-activity-${userId}`);
    });

    // Leave analytics room
    socket.on("leave-admin-analytics", () => {
      socket.leave("admin-analytics");
      console.log(`📊 Socket ${socket.id} left admin-analytics`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Emit new activity to admin panels tracking this user
export const emitUserActivity = (userId, activityData) => {
  try {
    if (io) {
      // Emit to specific user detail page
      io.to(`user-activity-${userId}`).emit("user-activity-update", {
        ...activityData,
        userId,
        timestamp: new Date(),
      });
      // Emit to analytics page (all admins)
      io.to("admin-analytics").emit("analytics-update", {
        userId,
        activityType: activityData.activityType,
        timestamp: new Date(),
      });
      console.log(`📡 Emitted activity for user ${userId}`);
    }
  } catch (error) {
    console.error("Error emitting user activity:", error);
  }
};
