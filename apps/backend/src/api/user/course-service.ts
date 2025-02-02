import * as courseDatabase from "@/database/courses";
import type { Course } from "@/schemas/course";
import type { UserCourse } from "@/schemas/user-course";
import { logger } from "@/server";
import ServiceResponse from "@/utils/service-response";
import { StatusCodes } from "http-status-codes";

export async function getAllCourses(): Promise<ServiceResponse<Course[] | null>> {
  try {
    const courses = await courseDatabase.getAllCourses();
    return ServiceResponse.ok("Retrieved all courses", courses);
  } catch (e) {
    logger.error(`Failed to get all courses: ${e}`);
    return ServiceResponse.internal("Failed to get all courses");
  }
}

export async function getCoursesByUserId(id: string): Promise<ServiceResponse<Course[] | null>> {
  try {
    const courses = await courseDatabase.getCoursesByUserId(id);
    return ServiceResponse.ok("Retrieved all courses for user", courses);
  } catch (e) {
    logger.error(`Failed to get courses for user: ${e}`);
    return ServiceResponse.internal("Failed to get courses for user");
  }
}

export async function getByCourseId(courseId: number): Promise<ServiceResponse<Course | null>> {
  try {
    const course = await courseDatabase.getByCourseId(courseId);
    if (!course) {
      return ServiceResponse.failure("No Course found", null, StatusCodes.NOT_FOUND);
    }
    return ServiceResponse.success<Course>("Course found", course);
  } catch (ex) {
    const errorMessage = `Error finding course: $${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while retrieving course.",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function storeCourse(
  course_code: string,
  title: string,
  instructor: string,
): Promise<ServiceResponse<Course | null>> {
  try {
    const course = await courseDatabase.storeCourse(course_code, title, instructor);
    if (course) {
      return ServiceResponse.success("Course stored successfully", course);
    }

    return ServiceResponse.failure("Course could not be retrieved", null, StatusCodes.INTERNAL_SERVER_ERROR);
  } catch (error) {
    console.error("Database query failed:", error);
    return ServiceResponse.failure("Failed to store course", null, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function storeUserCourse(userId: string, courseId: number): Promise<ServiceResponse<UserCourse | null>> {
  try {
    const userCourse = await courseDatabase.storeUserCourse(userId, courseId);
    return ServiceResponse.success("User course stored successfully", userCourse);
  } catch (error) {
    console.error("Database query failed:", error);
    return ServiceResponse.failure("Failed to store user course", null, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function deleteUserCourse(userId: string, courseId: number): Promise<ServiceResponse<null>> {
  try {
    await courseDatabase.deleteUserCourse(userId, courseId);
    return ServiceResponse.success("User course deleted successfully", null);
  } catch (error) {
    console.error("Database query failed:", error);
    return ServiceResponse.failure("Failed to delete user course", null, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
