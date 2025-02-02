import { clerkClient } from "@clerk/express";
import type { Request, RequestHandler, Response } from "express";

import * as searchService from "@/api/search/search-service";
import ServiceResponse from "@/utils/service-response";
import * as courseService from "./course-service";
import * as feedbackService from "./feedback-service";
import * as officeHourService from "./office-hour-service";
import * as userService from "./user-service";

export const getAllUsers: RequestHandler = async (_req: Request, res: Response) => {
  const serviceResponse = await userService.getAll();
  serviceResponse.emit(res);
};

export const getUser: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.auth.userId;
  const serviceResponse = await userService.getById(userId);
  serviceResponse.emit(res);
};

export const storeUser: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.auth.userId;
  const clerkUser = await clerkClient.users.getUser(userId);
  if (!clerkUser) {
    return res.status(404).json({ error: "No Clerk User found" });
  }
  const email = clerkUser.primaryEmailAddress?.emailAddress || "";
  if (!email) {
    return res.status(400).json({ error: "No email found for user" });
  }

  const results = await searchService.searchDirectory({
    first_name: "",
    last_name: "",
    email,
    type: "staff",
  });

  const userType = results.data.some((result) => result.email === email) ? "professor" : "student";

  const serviceResponse = await userService.storeUser(userId, userType);
  serviceResponse.emit(res);
};

export const getCoursesByUserId: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.auth.userId;
  const serviceResponse = await courseService.getCoursesByUserId(userId);
  serviceResponse.emit(res);
};

export const deleteUserCourse: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.auth.userId;
  const course_id = Number(req.params.course_id);
  const serviceResponse = await courseService.deleteUserCourse(userId, course_id);
  serviceResponse.emit(res);
};

export const storeUserCourse: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.auth.userId;
  const course_id = Number(req.params.course_id);
  const serviceResponse = await courseService.storeUserCourse(userId, course_id);
  serviceResponse.emit(res);
};

export const getOfficeHoursByUserId: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.auth.userId;
  const serviceResponse = await officeHourService.getOfficeHoursByUserId(userId);
  serviceResponse.emit(res);
};

export const getIcalFileByIds: RequestHandler = async (req: Request, res: Response) => {
  if (req.query.ids !== undefined) {
    const ids = req.query.ids.toString().split(",").map(Number);
    const serviceResponse = await officeHourService.getIcalFileByIds(ids);
    serviceResponse.emit(res);
  } else {
    ServiceResponse.failure("Missing query parameters", null).emit(res);
  }
};

export const getIcalFileByUserId: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.auth.userId;
  const serviceResponse = await officeHourService.getIcalFileByUserId(userId);
  serviceResponse.emit(res);
};

export const storeFeedback: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.auth.userId;
  const { content, rating } = req.body;
  const serviceResponse = await feedbackService.storeFeedback(userId, rating, content);
  serviceResponse.emit(res);
};

export const storeOfficeHour: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.auth.userId;
  const serviceResponse = await officeHourService.storeOfficeHours(req.body, userId);
  if (serviceResponse.data) {
    console.log("Saving course for user after storing office hour");
    const storeResponse = await courseService.storeUserCourse(userId, serviceResponse.data.course_id);
    if (!storeResponse.success) {
      console.log("Error saving course for user after storing office hour");
      storeResponse.emit(res);
    }
  }
  serviceResponse.emit(res);
};

export const storeListOfficeHours: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.auth.userId;
  const serviceResponse = await officeHourService.storeOfficeHours(req.body, userId);
  if (serviceResponse.data) {
    console.log("Saving course for user after storing office hour");
    const storeResponse = await courseService.storeUserCourse(userId, serviceResponse.data[0].course_id);
    if (!storeResponse.success) {
      console.log("Error saving course for user after storing office hour");
      storeResponse.emit(res);
    }
  }
  serviceResponse.emit(res);
};

export const deleteOfficeHours: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.auth.userId;
  if (!req.query.ids) {
    return ServiceResponse.failure("Missing query parameters", null, 400).emit(res);
  }
  const ids = req.query.ids.toString().split(",").map(Number);
  const serviceResponse = await officeHourService.deleteOfficeHours(ids, userId);
  serviceResponse.emit(res);
};

export const storeCourse: RequestHandler = async (req: Request, res: Response) => {
  const { course_code, title, instructor } = req.body;
  const serviceResponse = await courseService.storeCourse(course_code, title, instructor);
  serviceResponse.emit(res);
};

export const getCourse: RequestHandler = async (req: Request, res: Response) => {
  const course_id = Number(req.params.course_id);
  if (isNaN(course_id)) {
    return ServiceResponse.failure("Invalid course ID", null, 400).emit(res);
  }
  const serviceResponse = await courseService.getByCourseId(course_id);
  serviceResponse.emit(res);
};

export const getAllCourses: RequestHandler = async (_req: Request, res: Response) => {
  const serviceResponse = await courseService.getAllCourses();
  serviceResponse.emit(res);
};

export const updateOfficeHour: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.auth.userId;
  const officeHourId = Number(req.params.office_hour_id);
  const serviceResponse = await officeHourService.updateOfficeHour(officeHourId, req.body, userId);
  serviceResponse.emit(res);
};
