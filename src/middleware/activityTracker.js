// src/middleware/activityTracker.js
import UserActivity from "../database/models/userActivity.model.js";
import { emitUserActivity } from "../utils/socket.js";

/**
 * Middleware to automatically track page views
 */
export const trackPageView = async (req, res, next) => {
  try {
    // Only track for authenticated users
    // req.user comes from JWT payload: { sub: userId, role, email }
    if (req.user && req.user.sub) {
      const userId = req.user.sub;
      const activityData = {
        user: userId,
        sessionId: req.sessionID || `session_${Date.now()}`,
        activityType: "page_view",
        page: {
          path: req.originalUrl || req.url,
          title: req.query.pageTitle || null,
          referrer: req.headers.referer || req.headers.referrer || null,
        },
        device: {
          userAgent: req.headers["user-agent"],
          platform: req.headers["sec-ch-ua-platform"] || null,
          isMobile: /mobile/i.test(req.headers["user-agent"]),
        },
        location: {
          ip: req.ip || req.connection.remoteAddress,
        },
      };

      // Don't wait for activity logging to complete
      UserActivity.create(activityData)
        .then((activity) => {
          // Emit real-time update to connected admin panels
          emitUserActivity(userId.toString(), activity.toObject());
        })
        .catch((err) => console.error("Page view tracking error:", err));
    }
  } catch (err) {
    console.error("trackPageView middleware error:", err);
  }

  next();
};

/**
 * Helper function to log authentication events
 */
export const logAuthEvent = async (userId, eventType, metadata = {}) => {
  try {
    const activity = await UserActivity.create({
      user: userId,
      sessionId: metadata.sessionId || `session_${Date.now()}`,
      activityType: eventType, // 'register', 'login', 'logout', 'email_verified'
      action: {
        metadata: {
          ...metadata,
          timestamp: new Date(),
        },
      },
      device: {
        userAgent: metadata.userAgent,
        platform: metadata.platform,
        isMobile: metadata.isMobile,
      },
      location: {
        ip: metadata.ip,
      },
    });

    // Emit real-time update
    emitUserActivity(userId.toString(), activity.toObject());
  } catch (err) {
    console.error(`Failed to log ${eventType} event:`, err);
  }
};

export default {
  trackPageView,
  logAuthEvent,
};
