// src/middleware/activityTracker.js
import UserActivity from "../database/models/userActivity.model.js";

/**
 * Middleware to automatically track page views
 */
export const trackPageView = async (req, res, next) => {
  try {
    // Only track for authenticated users
    if (req.user && req.user._id) {
      // Don't wait for activity logging to complete
      UserActivity.create({
        user: req.user._id,
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
      }).catch((err) => console.error("Page view tracking error:", err));
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
    await UserActivity.create({
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
  } catch (err) {
    console.error(`Failed to log ${eventType} event:`, err);
  }
};

export default {
  trackPageView,
  logAuthEvent,
};
