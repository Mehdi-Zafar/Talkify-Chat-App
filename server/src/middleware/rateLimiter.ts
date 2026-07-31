// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";

// Strict limiter for auth endpoints — login, register, OTP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per 15 min
  message: {
    message: "Too many attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Looser limiter for general API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict for OTP specifically — prevent OTP spam
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // only 3 OTP requests per 5 min
  message: {
    message: "Too many OTP requests. Please wait 5 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // ~2 refreshes/min sustained — well above any legitimate need
  message: {
    message: "Too many token refresh attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
