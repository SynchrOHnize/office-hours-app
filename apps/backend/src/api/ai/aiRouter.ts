// aiRouter.ts
import express, { Router } from "express";
import { AIController } from "./aiController";
import { AIService } from "./aiService";
import { specialRateLimiter } from "@/common/middleware/rateLimiter";

export const aiRouter = express.Router();
aiRouter.use(specialRateLimiter);
const aiService = new AIService();
const aiController = new AIController(aiService);

aiRouter.post("/office-hours", aiController.parseOfficeHours);