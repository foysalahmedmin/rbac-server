import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit;

// Global rate limiter for all API requests
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many requests from this IP, please try again after 15 minutes',
  },
  validate: { trustProxy: false },
});

// Stricter rate limiter for authentication routes (login, register, forgot password)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many authentication attempts, please try again after 15 minutes',
  },
  validate: { trustProxy: false },
});
