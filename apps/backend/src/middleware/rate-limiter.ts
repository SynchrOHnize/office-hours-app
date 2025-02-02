import type { Request } from "express";
import { rateLimit } from "express-rate-limit";

const rateLimiter = rateLimit({
  legacyHeaders: true,
  limit: 240,
  windowMs: 60,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  keyGenerator: (req: Request) => req.ip!,
});

export const specialRateLimiter = rateLimit({
  legacyHeaders: true,
  limit: 20,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  windowMs: 1000 * 60 * 60,
  keyGenerator: (req: Request) => req.ip!,
});

export default rateLimiter;
