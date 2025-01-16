// llmController.ts
import { type Request, type Response } from "express";
import { LlmService } from "./llmService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

export class LlmController {
  private llmService: LlmService;
 
  constructor(llmService: LlmService) {
    this.llmService = llmService;
  }
 
  public parseOfficeHoursJson = async (req: Request, res: Response) => {
    const { course_id, raw_data } = req.body;
    const serviceResponse = await this.llmService.parseOfficeHoursJson(course_id, raw_data);
    return handleServiceResponse(serviceResponse, res);
  };

  public parseOfficeHoursText = async (req: Request, res: Response) => {
    const { raw_data } = req.body;
    const serviceResponse = await this.llmService.parseOfficeHoursText(raw_data);
    return handleServiceResponse(serviceResponse, res);
  };
 }