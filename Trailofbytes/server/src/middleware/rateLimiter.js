import rateLimit from "express-rate-limit";

export const ipLimiter = rateLimit({
  windowMs: 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

export const actionLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  keyGenerator: (req) => req.team?._id?.toString() || req.ip,
  standardHeaders: true,
  legacyHeaders: false
});

