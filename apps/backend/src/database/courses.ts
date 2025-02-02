import sql from "@/database";
import type { Course } from "@/schemas/course";
import type { UserCourse } from "@/schemas/user-course";
import postgres from "postgres";

export async function getAllCourses(): Promise<Course[]> {
  const rows = await sql`SELECT * FROM courses ORDER BY course_code`;
  return rows as unknown[] as Course[];
}

export async function getByCourseId(id: number): Promise<Course | null> {
  const rows = await sql`SELECT * FROM courses WHERE id = ${id}`;
  if (!rows.length) return null;
  return rows[0] as Course;
}

export async function getAllUserCourses(): Promise<UserCourse[]> {
  const rows = await sql`SELECT * FROM user_courses`;
  return rows as unknown[] as UserCourse[];
}

export async function getCoursesByUserId(id: string): Promise<Course[]> {
  const rows = await sql`
    SELECT * FROM courses
    JOIN user_courses ON courses.id = user_courses.course_id
    WHERE user_id = ${id}
  `;
  return rows as unknown[] as Course[];
}

export async function storeCourse(code: string, title: string, instructor: string): Promise<Course> {
  try {
    const rows = await sql`
      INSERT INTO courses (course_code, title, instructor)
      VALUES (${code}, ${title}, ${instructor})
      RETURNING *
    `;
    return rows[0] as Course;
  } catch (e: unknown) {
    // Handle unique_violation error explicitly
    if (!(e instanceof postgres.PostgresError && e.code === "23505")) throw e;

    // Fetch the existing course by its unique fields
    const rows = await sql`
      SELECT * FROM courses
      WHERE course_code = ${code} AND title = ${title} AND instructor = ${instructor}
    `;

    if (!rows.length) throw new Error(`Failed to retrieve existing course`);

    return rows[0] as Course;
  }
}

export async function storeUserCourse(userId: string, courseId: number): Promise<UserCourse> {
  const rows = await sql`
    INSERT INTO user_courses (user_id, course_id)
    VALUES (${userId}, ${courseId})
    RETURNING *
  `;
  return rows[0] as UserCourse;
}

export async function deleteUserCourse(userId: string, courseId: number): Promise<boolean> {
  const rows = await sql`
    DELETE FROM user_courses
    WHERE user_id = ${userId} AND course_id = ${courseId}
  `;
  return rows.count > 0;
}
