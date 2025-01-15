import express, { type Router } from "express";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import { validateRequest } from "@/common/utils/httpHandlers";
import { UserController } from "./userController";
import { db } from "@/database/init";
import { UserService } from "./userService";
import { UserRepository } from "@/database/userRepository";
import { CourseRepository } from "@/database/courseRepository";
import { OfficeHourRepository } from "@/database/officeHoursRepository";
import { UserCourseService } from "./userCourseService";
import { OfficeHourService } from "./officeHourService";
import { FeedbackService } from "./feedbackService";
import { FeedbackRepository } from "@/database/feedbackRepository";
import { PostFeedbackSchema } from "@/common/schemas/feedbackSchema";
import {
  PostOfficeHourSchema,
  PostListOfficeHourSchema,
} from "@/common/schemas/officeHoursSchema";
import { StoreCourseSchema } from "@/common/schemas/courseSchema";
import { SearchService } from "../search/searchService";
import { adminAuth } from "@/common/middleware/adminAuth";
import { uflAuth } from "@/common/middleware/uflAuth";

const userRepository = new UserRepository(db);
const userService = new UserService(userRepository);

const courseRepository = new CourseRepository(db);
const courseService = new UserCourseService(courseRepository);

const officeHourRepository = new OfficeHourRepository(db);
const officeHourService = new OfficeHourService(officeHourRepository);

const feedbackRepository = new FeedbackRepository(db);
const feedbackService = new FeedbackService(feedbackRepository);

const searchService = new SearchService();

const userController = new UserController(
  userService,
  courseService,
  officeHourService,
  feedbackService,
  searchService
);

export const userRouter: Router = express.Router();

// Clerk
userRouter.use(requireAuth());
userRouter.use(uflAuth(userService));

userRouter.get("/all", adminAuth(userService), userController.getAllUsers);
userRouter.get("/me", userController.getUser);
userRouter.post("/me", userController.storeUser);

// Courses
userRouter.get("/courses/:course_id", userController.getCourse);
userRouter.get("/courses", userController.getAllCourses);
userRouter.post(
  "/courses",
  adminAuth(userService),
  validateRequest(StoreCourseSchema),
  userController.storeCourse
);

// User Courses
userRouter.get("/me/courses", userController.getCoursesByUserId);
userRouter.post("/me/courses/:course_id", userController.storeUserCourse);
userRouter.delete("/me/courses/:course_id", userController.deleteUserCourse);

// Office Hours
userRouter.get("/me/office-hours", userController.getOfficeHoursByUserId);
userRouter.post(
  "/office-hours",
  adminAuth(userService),
  validateRequest(PostOfficeHourSchema),
  userController.storeOfficeHour
);
userRouter.post(
  "/office-hours-list",
  adminAuth(userService),
  validateRequest(PostListOfficeHourSchema),
  userController.storeListOfficeHours
);
userRouter.delete(
  "/office-hours",
  adminAuth(userService),
  userController.deleteOfficeHours
);
userRouter.put(
  "/office-hours/:office_hour_id",
  adminAuth(userService),
  userController.updateOfficeHour
);

// iCal
userRouter.get("/me/ical-file", userController.getIcalFileByUserId);
userRouter.get("/ical-file", userController.getIcalFileByIds);

// Feedback
userRouter.post(
  "/feedback",
  validateRequest(PostFeedbackSchema),
  userController.storeFeedback
);
