// aiController.ts
import { type Request, type Response } from "express";
import { AIService } from "./aiService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

export class AIController {
  private aiService: AIService;
 
  constructor(aiService: AIService) {
    this.aiService = aiService;
  }
 
  public parseOfficeHours = async (req: Request, res: Response) => {
    const { course_id, raw_data } = req.body;
    const serviceResponse = await this.aiService.parseOfficeHours(course_id, raw_data);
    return handleServiceResponse(serviceResponse, res);
  };
 }