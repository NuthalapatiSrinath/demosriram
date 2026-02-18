// src/middleware/security.js
import helmet from "helmet";
import hpp from "hpp";

/**
 * Security headers with helmet
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * Prevent NoSQL injection by sanitizing user input
 * Express 5 compatible custom sanitization middleware
 */
const sanitizeValue = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in sanitized) {
    if (key.includes("$") || key.includes(".")) {
      // Replace keys with $ or . which are used in NoSQL injection
      const newKey = key.replace(/\$/g, "_").replace(/\./g, "_");
      sanitized[newKey] = sanitized[key];
      delete sanitized[key];
    }

    if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeValue(sanitized[key]);
    }
  }

  return sanitized;
};

export const mongoSanitizeMiddleware = (req, res, next) => {
  // Sanitize body and params (these are writable)
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  // Note: req.query is read-only in Express 5, so we skip it
  // Query sanitization should be handled at the validation layer
  next();
};

/**
 * Prevent HTTP Parameter Pollution
 */
export const hppMiddleware = hpp({
  whitelist: ["page", "limit", "sort"], // Allow these parameters to be duplicated
});

/**
 * CORS configuration
 * Allows all origins for Vercel deployment
 */
export const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms - ${req.ip}`,
    );
  });

  next();
};
