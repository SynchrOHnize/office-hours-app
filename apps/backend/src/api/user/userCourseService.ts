import { StatusCodes } from "http-status-codes";

import type { Course } from "@/common/schemas/courseSchema";
import { CourseRepository } from "@/database/courseRepository";
import { ServiceResponse } from "@/common/schemas/serviceResponse";
import { logger } from "@/server";
import { UserCourse } from "@/common/schemas/userCourseSchema";

export class UserCourseService {
  private courseRepository: CourseRepository;

  constructor(repository: CourseRepository) {
    this.courseRepository = repository;
  }

  // Retrieves all courses from the database
  async getAll(): Promise<ServiceResponse<Course[] | null>> {
    try {
      const courses = await this.courseRepository.getAllCourses();
      if (!courses || courses.length === 0) {
        return ServiceResponse.failure("No Courses found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<Course[]>("Courses found", courses);
    } catch (ex) {
      const errorMessage = `Error finding all courses: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while retrieving courses.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getCoursesByUserId(id: string): Promise<ServiceResponse<Course[] | null>> {
    try {
      const courses = await this.courseRepository.getCoursesByUserId(id);
      // const courses = await this.courseRepository.getAllCourses();
      if (!courses) {
        return ServiceResponse.failure("No Courses found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<Course[]>("Courses found", courses);
    } catch (ex) {
      const errorMessage = `Error finding all courses: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while retrieving courses.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async storeUserCourse(user_id: string, course_id: number): Promise<ServiceResponse<UserCourse | null>> {
    const response = await this.courseRepository.storeUserCourse(user_id, course_id);
    return response;
  }

  async deleteUserCourse(user_id: string, course_id: number): Promise<ServiceResponse<UserCourse | null>> {
    const response = await this.courseRepository.deleteUserCourse(user_id, course_id);
    return response;
  }

  async getByCourseId(course_id: number): Promise<ServiceResponse<Course | null>> {
    try {
      const course = await this.courseRepository.getByCourseId(course_id);
      if (!course) {
        return ServiceResponse.failure("No Course found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<Course>("Course found", course);
    } catch (ex) {
      const errorMessage = `Error finding course: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while retrieving course.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async storeCourse(course_id: number, course_code: string, title: string): Promise<ServiceResponse<Course | null>> {
    const response = await this.courseRepository.storeCourse(course_id, course_code, title);
    return response;
  }
}
