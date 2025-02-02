import express, { type Request, type Response, type Router } from "express";
import { CanvasController } from "./canvasController";

import ServiceResponse from "@/utils/service-response";
import ServiceResponse from "@/utils/service-response";

const canvasService = new CanvasService();
const canvasController = new CanvasController(canvasService);

const canvasRouter: Router = express.Router();

canvasRouter.get("/courses", canvasController.getCourses);
canvasRouter.get("/syllabi");
canvasRouter.get("/files", canvasController.getFiles);

export default canvasRouter;
