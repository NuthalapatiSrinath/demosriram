import { createServer } from "http";
import app from "./app.js";
import { connectDB } from "./../database/index.js";
import { config } from "./../config/index.js";
import { initializeSocket } from "./../utils/socket.js";

const httpServer = createServer(app);

async function start() {
  try {
    // Connect to database
    await connectDB();

    // Only initialize Socket.io if NOT in Vercel environment
    // Socket.io doesn't work in serverless
    if (process.env.VERCEL !== "1") {
      const io = initializeSocket(httpServer);
      console.log("✅ Socket.io initialized");
    }

    // Only start the server if not in Vercel environment
    // Vercel handles the server startup automatically
    if (process.env.VERCEL !== "1") {
      const port = config?.app?.port ?? 3000;
      httpServer.listen(port, () => {
        console.log("=================================");
        console.log(`🚀 Server running on port ${port}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`🔗 API: http://localhost:${port}/api`);
        console.log(`📡 Socket.io ready for real-time updates`);
        console.log("=================================");
      });
    } else {
      console.log("🚀 Running on Vercel serverless environment");
      console.log("⚠️  Socket.io disabled in serverless mode");
    }
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Initialize database connection (only for local development)
if (process.env.VERCEL !== "1") {
  start();
}

export default app;
