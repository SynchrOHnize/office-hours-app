import { DirectorySearchSchema } from "@/schemas/directory-search";
import type { Request, RequestHandler, Response } from "express";
import * as searchService from "./search-service";

export const searchDirectory: RequestHandler = async (req: Request, res: Response) => {
  const params = DirectorySearchSchema.parse(req.query);
  const serviceResponse = await searchService.searchDirectory(params);
  serviceResponse.emit(res);
};

export const searchClasses: RequestHandler = async (req: Request, res: Response) => {
  const keyword = req.params.keyword;
  const serviceResponse = await searchService.searchClasses(keyword);
  serviceResponse.emit(res);
};

export const listGraduateCourses: RequestHandler = async (_req: Request, res: Response) => {
  const serviceResponse = await searchService.listGraduateCourses();
  serviceResponse.emit(res);
};
