import ServiceResponse from "@/utils/service-response";
import express, { type Request, type Response, type Router } from "express";

const okRouter: Router = express.Router();

okRouter.get("/", (_req: Request, res: Response) => {
  ServiceResponse.success("We are online", null).emit(res);
});

export default okRouter;
