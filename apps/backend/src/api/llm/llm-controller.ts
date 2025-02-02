import type { Request, Response } from "express";
import * as llmService from "./llm-service";

export const parseOfficeHoursJson = async (req: Request, res: Response) => {
  const { course_id, raw_data } = req.body;
  const serviceResponse = await llmService.parseOfficeHoursJson(course_id, raw_data);
  serviceResponse.emit(res);
};

export const parseOfficeHoursText = async (req: Request, res: Response) => {
  const { raw_data } = req.body;
  const serviceResponse = await llmService.parseOfficeHoursText(raw_data);
  serviceResponse.emit(res);
};

export const parseOfficeHoursJsonStream = async (req: Request, res: Response) => {
  const { course_id, raw_data } = req.body;
  const serviceResponse = await llmService.parseOfficeHoursJsonStream(course_id, raw_data, res);
  serviceResponse.emit(res);
};
