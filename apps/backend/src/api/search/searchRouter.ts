import express, { type Router } from 'express';
import { SearchController } from './searchController';
import { SearchService } from "./searchService";
import { cacheMiddleware } from '@/common/middleware/cache';

const searchService = new SearchService();
const searchController = new SearchController(searchService);

export const searchRouter: Router = express.Router();

searchRouter.get("/directory", searchController.searchDirectory);
searchRouter.get("/classes/:keyword", cacheMiddleware, searchController.searchClasses);
searchRouter.get('/graduate-courses-list', searchController.listGraduateCourses);
