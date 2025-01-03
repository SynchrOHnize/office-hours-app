import type { Request } from "express";
import { rateLimit } from "express-rate-limit";

import { env } from "@/common/utils/envConfig";

const rateLimiter = rateLimit({
  legacyHeaders: true,
  limit: env.COMMON_RATE_LIMIT_MAX_REQUESTS,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  windowMs: env.COMMON_RATE_LIMIT_WINDOW_MS,
  keyGenerator: (req: Request) => req.ip as string,
});

export const specialRateLimiter = rateLimit({
  legacyHeaders: true,
  limit: 20,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  windowMs: 1000 * 60 * 60,
  keyGenerator: (req: Request) => req.ip as string,
});

export default rateLimiter;
