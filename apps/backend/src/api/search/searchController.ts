import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { SearchService } from "./searchService";
import { DirectorySearchSchema } from "@/common/schemas/directorySearchSchema";

export class SearchController {

  private searchService: SearchService;

  constructor(searchService: SearchService) {
    this.searchService = searchService;
  }

  public searchDirectory: RequestHandler = async (req: Request, res: Response) => {
    const params = DirectorySearchSchema.parse(req.query);
    const serviceResponse = await this.searchService.searchDirectory(params);
    return handleServiceResponse(serviceResponse, res);
  };

  public searchClasses: RequestHandler = async (req: Request, res: Response) => {
    const keyword = req.params.keyword;
    const serviceResponse = await this.searchService.searchClasses(keyword);
    return handleServiceResponse(serviceResponse, res);
  };

  public listGraduateCourses: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await this.searchService.listGraduateCourses();
    return handleServiceResponse(serviceResponse, res);
  };

}
