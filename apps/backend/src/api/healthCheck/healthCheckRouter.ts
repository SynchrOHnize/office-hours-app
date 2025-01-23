import express, { type Request, type Response, type Router } from "express";
import { ServiceResponse } from "@/common/schemas/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { cacheMiddleware } from "@/common/middleware/cache";

export const healthCheckRouter: Router = express.Router();

healthCheckRouter.get("/", cacheMiddleware, (req: Request, res: Response) => {
  console.log(req.originalUrl, req.url, req.baseUrl)
  const serviceResponse = ServiceResponse.success("Service is healthy", null);
  return handleServiceResponse(serviceResponse, res);
});
