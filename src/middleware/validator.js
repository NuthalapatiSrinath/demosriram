// src/middleware/validator.js
import validator from "validator";

/**
 * Validate email format
 */
export const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  next();
};

/**
 * Validate password strength
 */
export const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  // Minimum 8 characters
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least one uppercase letter",
    });
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least one lowercase letter",
    });
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least one number",
    });
  }

  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least one special character",
    });
  }

  next();
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (req, res, next) => {
  // Sanitize all string fields in body
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = validator.escape(req.body[key]);
      }
    });
  }

  next();
};

/**
 * Validate MongoDB ObjectId
 */
export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!validator.isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    next();
  };
};
