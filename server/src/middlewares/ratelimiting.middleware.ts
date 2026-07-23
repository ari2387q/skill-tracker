import rateLimit from "express-rate-limit"

export const loginlimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many login attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5,
  message: { message: "Too many signup attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3,
  message: { message: "Too many verification emails requested. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});