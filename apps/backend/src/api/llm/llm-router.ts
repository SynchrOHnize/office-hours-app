import { specialRateLimiter } from "@/middleware/rate-limiter";
// llmRouter.ts
import { Router } from "express";
import * as llmController from "./llm-controller";

const llmRouter = Router();

llmRouter.use(specialRateLimiter);
llmRouter.post("/json/office-hours", llmController.parseOfficeHoursJson);
llmRouter.post("/text/office-hours", llmController.parseOfficeHoursText);
llmRouter.post("/stream/office-hours", llmController.parseOfficeHoursJsonStream);

export default llmRouter;
