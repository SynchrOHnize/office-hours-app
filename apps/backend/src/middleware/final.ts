import ServiceResponse from "@/utils/service-response";
import type { Request, Response } from "express";

export default (_req: Request, res: Response) => {
  ServiceResponse.notFound("Not found").emit(res);
};
