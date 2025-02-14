import type { Course } from "@/common/schemas/courseSchema";
import { ServiceResponse } from "@/common/schemas/serviceResponse";
import { UserCourse } from "@/common/schemas/userCourseSchema";
import { StatusCodes } from "http-status-codes";
import { FieldPacket, Pool, QueryResult, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export class CourseRepository {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db; // Set the db connection to a class property
  }

  async getAllCourses(): Promise<Course[]> {
    try {
      const [rows] = await this.db.query("SELECT * FROM courses ORDER BY course_code");
      return rows as Course[];
    } catch (error) {
      console.error("Database query failed:", error);
      throw error;
    }
  }

  async getByCourseId(id: number): Promise<Course | null> {
    try {
      // Parameterized query to prevent SQL injection
      const [rows]: [any[], FieldPacket[]] = await this.db.query("SELECT * FROM courses WHERE id = ?", [id]);

      // Check if rows exist and are in an array-like format
      if (rows.length === 0) {
        return null;
      }

      // Return the first row as a Course object
      return rows[0] as Course;
    } catch (error) {
      console.error("Database query failed:", error);
      throw new Error("Failed to fetch course from the database");
    }
  }

  async getAllUserCourses(): Promise<UserCourse[]> {
    try {
      const [rows] = await this.db.query("SELECT * FROM user_courses");
      return rows as UserCourse[];
    } catch (error) {
      console.error("Database query failed:", error);
      throw error;
    }
  }

  async getCoursesByUserId(id: string): Promise<Course[]> {
    try {
      // Parameterized query to prevent SQL injection
      const [rows]: [any[], FieldPacket[]] = await this.db.query(
        "SELECT * FROM courses JOIN user_courses ON courses.id = user_courses.course_id WHERE user_id = ?",
        [id]
      );

      // Check if rows exist and are in an array-like format
      if (rows.length === 0) {
        return [];
      }

      return rows as Course[];
    } catch (error) {
      console.error("Database query failed:", error);
      throw new Error("Failed to fetch user's courses from the database");
    }
  }

  async storeCourse(course_code: string, title: string, instructor: string): Promise<Course | null> {
    try {
      // Insert the course
      const [result] = await this.db.execute<ResultSetHeader>(
        "INSERT INTO courses (course_code, title, instructor) VALUES (?, ?, ?)",
        [course_code, title, instructor]
      );
      
      // The `insertId` contains the ID of the newly inserted row
      const course_id = result.insertId;
  
      // Fetch the newly inserted course
      const [rows] = await this.db.execute<RowDataPacket[]>(
        "SELECT * FROM courses WHERE id = ?",
        [course_id]
      );
  
      if (rows && rows.length > 0) {
        return rows[0] as Course;
      }
  
      return null; // If no rows were found
    } catch (error: any) {
      // Handle duplicate entry error explicitly
      if (error.code === "ER_DUP_ENTRY") {
        // Fetch the existing course by its unique fields
        const [rows] = await this.db.execute<RowDataPacket[]>(
          "SELECT * FROM courses WHERE course_code = ? AND title = ? AND instructor = ?",
          [course_code, title, instructor]
        );
  
        if (rows && rows.length > 0) {
          console.log("Course already exists:", course_code, title, instructor)
          return rows[0] as Course; // Return the existing course
        }
      } else {
        throw error
      }
    }
    return null;
  }

  async storeUserCourse(user_id: string, course_id: number): Promise<ServiceResponse<UserCourse | null>> {
    try {
      // Insert the user course
      const [result] = await this.db.execute<ResultSetHeader>("INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)", [user_id, course_id]);

      // Fetch the newly inserted user course
      const [rows] = await this.db.execute<RowDataPacket[]>("SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?", [user_id, course_id]);

      if (!rows || rows.length === 0) {
        return ServiceResponse.failure("User course was created but could not be retrieved", null, StatusCodes.INTERNAL_SERVER_ERROR);
      }

      return ServiceResponse.success("User course stored successfully", rows[0] as UserCourse);
    } catch (error) {
      console.error("Database query failed:", error);
      return ServiceResponse.failure("Failed to store user course", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteUserCourse(user_id: string, course_id: number): Promise<ServiceResponse<UserCourse | null>> {
    try {
      // Delete the user course
      const [rows] = await this.db.execute<RowDataPacket[]>("SELECT * FROM user_courses WHERE user_id = ? AND id = ?", [user_id, course_id]);

      if (!rows || rows.length === 0) {
        return ServiceResponse.failure("User course could not be retrieved", null, StatusCodes.INTERNAL_SERVER_ERROR);
      }

      const userCourse = rows[0] as UserCourse;


      const [result] = await this.db.execute<ResultSetHeader>("DELETE FROM user_courses WHERE user_id = ? AND id = ?", [user_id, course_id]);

      // Check if the user course was deleted
      if (result.affectedRows === 0) {
        return ServiceResponse.failure("User course not found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("User course deleted successfully", null);
    } catch (error) {
      console.error("Database query failed:", error);
      return ServiceResponse.failure("Failed to delete user course", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}