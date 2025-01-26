// llmRouter.ts
import { Router } from "express";
import { LlmController } from "./llmController";
import { LlmService } from "./llmService";
import { specialRateLimiter } from "@/common/middleware/rateLimiter";

export const llmRouter = Router();
llmRouter.use(specialRateLimiter);
const llmService = new LlmService();
const llmController = new LlmController(llmService);

llmRouter.post("/json/office-hours", llmController.parseOfficeHoursJson);
llmRouter.post("/text/office-hours", llmController.parseOfficeHoursText);
llmRouter.post("/stream/office-hours", llmController.parseOfficeHoursJsonStream);