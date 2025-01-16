// llmRouter.ts
import express, { Router } from "express";
import { LlmController } from "./llmController";
import { LlmService } from "./llmService";
import { specialRateLimiter } from "@/common/middleware/rateLimiter";

export const llmRouter = express.Router();
llmRouter.use(specialRateLimiter);
const llmService = new LlmService();
const llmController = new LlmController(llmService);

llmRouter.post("/json/office-hours", llmController.parseOfficeHoursJson);
llmRouter.post("/text/office-hours", llmController.parseOfficeHoursText);