import type { Request, RequestHandler, Response } from "express";
import { clerkClient } from "@clerk/clerk-sdk-node";

import { UserService } from "@/api/user/userService";
import { UserCourseService } from "./userCourseService";
import { OfficeHourService } from "./officeHourService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { FeedbackService } from "./feedbackService";
import { SearchService } from "../search/searchService";
import { ServiceResponse } from "@/common/schemas/serviceResponse";

export class UserController {
  private userService: UserService;
  private userCourseService: UserCourseService;
  private officeHourService: OfficeHourService;
  private feedbackService: FeedbackService;
  private searchService: SearchService;

  constructor(
    userService: UserService,
    userCourseService: UserCourseService,
    officeHourService: OfficeHourService,
    feedbackService: FeedbackService,
    searchService: SearchService
  ) {
    this.userService = userService;
    this.userCourseService = userCourseService;
    this.officeHourService = officeHourService;
    this.feedbackService = feedbackService;
    this.searchService = searchService;
  }

  public getAllUsers: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await this.userService.getAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.auth.userId;
    const serviceResponse = await this.userService.getById(userId);
    return handleServiceResponse(serviceResponse, res);
  };

  public storeUser: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.auth.userId;
    const clerkUser = await clerkClient.users.getUser(userId);
    if (!clerkUser) {
      return res.status(404).json({ error: "No Clerk User found" });
    }
    const email = clerkUser.primaryEmailAddress?.emailAddress || "";
    if (!email) {
      return res.status(400).json({ error: "No email found for user" });
    }

    const results = await this.searchService.searchDirectory({
      first_name: "",
      last_name: "",
      email,
      type: "staff",
    });

    const userType = results.data.some((result) => result.email === email)
      ? "professor"
      : "student";

    const serviceResponse = await this.userService.storeUser(userId, userType);
    return handleServiceResponse(serviceResponse, res);
  };

  public getCoursesByUserId: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const userId = req.auth.userId;
    const serviceResponse = await this.userCourseService.getCoursesByUserId(
      userId
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteUserCourse: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const userId = req.auth.userId;
    const course_id = Number(req.params.course_id);
    const serviceResponse = await this.userCourseService.deleteUserCourse(
      userId,
      course_id
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public storeUserCourse: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const userId = req.auth.userId;
    const course_id = Number(req.params.course_id);
    const serviceResponse = await this.userCourseService.storeUserCourse(
      userId,
      course_id
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getOfficeHoursByUserId: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const userId = req.auth.userId;
    const serviceResponse = await this.officeHourService.getOfficeHoursByUserId(
      userId
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getIcalFileByIds: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    if (req.query.ids !== undefined) {
      let ids = req.query.ids.toString().split(",").map(Number);
      const serviceResponse = await this.officeHourService.getIcalFileByIds(
        ids
      );
      return handleServiceResponse(serviceResponse, res);
    } else {
      return handleServiceResponse(
        ServiceResponse.failure("Missing query parameters", null),
        res
      );
    }
  };

  public getIcalFileByUserId: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const userId = req.auth.userId;
    const serviceResponse = await this.officeHourService.getIcalFileByUserId(
      userId
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public storeFeedback: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const userId = req.auth.userId;
    const { content, rating } = req.body;
    const serviceResponse = await this.feedbackService.storeFeedback(
      userId,
      rating,
      content
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public storeOfficeHour: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const userId = req.auth.userId;
    const user = await this.userService.getById(userId);
    const role = user?.data?.role || "";
    const authorizedRoles = ["professor", "admin"];
    if (!authorizedRoles.includes(role)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const serviceResponse = await this.officeHourService.storeOfficeHour(
      req.body,
      userId
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public storeListOfficeHours: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const userId = req.auth.userId;
    const user = await this.userService.getById(userId);
    const role = user?.data?.role || "";
    const authorizedRoles = ["professor", "admin"];
    if (!authorizedRoles.includes(role)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const serviceResponse = await this.officeHourService.storeListOfficeHour(
      req.body,
      userId
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteOfficeHours: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const userId = req.auth.userId;
    if (req.query.ids !== undefined) {
      let ids = req.query.ids.toString();
      const serviceResponse = await this.officeHourService.deleteOfficeHours(
        ids,
        userId
      );
      return handleServiceResponse(serviceResponse, res);
    } else {
      return handleServiceResponse(
        ServiceResponse.failure("Missing query parameters", null),
        res
      );
    }
  };

  public storeCourse: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.auth.userId;
    const { course_id, course_code, title } = req.body;
    const serviceResponse = await this.userCourseService.storeCourse(
      course_id,
      course_code,
      title
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getCourse: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.auth.userId;
    const course_id = Number(req.params.course_id);

    if (isNaN(course_id)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }

    const serviceResponse = await this.userCourseService.getByCourseId(
      course_id
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getAllCourses: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await this.userCourseService.getAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public updateOfficeHour: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const userId = req.auth.userId;
    const officeHourId = Number(req.params.office_hour_id);
    const serviceResponse = await this.officeHourService.updateOfficeHour(
      officeHourId,
      req.body,
      userId
    );

    return handleServiceResponse(serviceResponse, res);
  };
}
