import { cacheMiddleware } from "@/middleware/cache";
import express, { type Router } from "express";
import * as searchController from "./search-controller";

const searchRouter: Router = express.Router();

searchRouter.get("/directory", searchController.searchDirectory);
searchRouter.get("/classes/:keyword", cacheMiddleware, searchController.searchClasses);
//searchRouter.get('/graduate-courses-list', searchController.listGraduateCourses);

export default searchRouter;
