import adminAuth from "@/middleware/admin-auth";
import uflAuth from "@/middleware/ufl-auth";
import validateRequest from "@/middleware/validate-request";
import { StoreCourseSchema } from "@/schemas/course";
import { PostFeedbackSchema } from "@/schemas/feedback";
import { PostListOfficeHourSchema, PostOfficeHourSchema } from "@/schemas/office-hour";
import { requireAuth } from "@clerk/express";
import express, { type Router } from "express";
import * as userController from "./user-controller";

const userRouter: Router = express.Router();

// Clerk
userRouter.use(requireAuth());
userRouter.use(uflAuth());

userRouter.get("/all", adminAuth(), userController.getAllUsers);
userRouter.get("/me", userController.getUser);
userRouter.post("/me", userController.storeUser);

// Courses
userRouter.get("/courses/:course_id", userController.getCourse);
userRouter.get("/courses", userController.getAllCourses);
userRouter.post("/courses", adminAuth(), validateRequest(StoreCourseSchema), userController.storeCourse);

// User Courses
userRouter.get("/me/courses", userController.getCoursesByUserId);
userRouter.post("/me/courses/:course_id", userController.storeUserCourse);
userRouter.delete("/me/courses/:course_id", userController.deleteUserCourse);

// Office Hours
userRouter.get("/me/office-hours", userController.getOfficeHoursByUserId);
userRouter.post("/office-hours", adminAuth(), validateRequest(PostOfficeHourSchema), userController.storeOfficeHour);
userRouter.post(
  "/office-hours-list",
  adminAuth(),
  validateRequest(PostListOfficeHourSchema),
  userController.storeListOfficeHours,
);
userRouter.delete("/office-hours", adminAuth(), userController.deleteOfficeHours);
userRouter.put("/office-hours/:office_hour_id", adminAuth(), userController.updateOfficeHour);

// iCal
userRouter.get("/me/ical-file", userController.getIcalFileByUserId);
userRouter.get("/ical-file", userController.getIcalFileByIds);

// Feedback
userRouter.post("/feedback", validateRequest(PostFeedbackSchema), userController.storeFeedback);

export default userRouter;
