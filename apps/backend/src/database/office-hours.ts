import sql from "@/database";
import type { OfficeHour } from "@/schemas/office-hour";

export async function getAllOfficeHours(): Promise<OfficeHour[]> {
  const rows = await sql`
    SELECT
      office_hours.*,
      courses.course_code
    FROM office_hours
    LEFT JOIN courses ON office_hours.course_id = courses.course_id
    WHERE office_hours.is_deleted = false
    ORDER BY courses.course_code, office_hours.day, office_hours.start_time
  `;

  return rows as unknown[] as OfficeHour[];
}

export async function getOfficeHoursByUserId(id: string): Promise<OfficeHour[]> {
  const rows = await sql`
    SELECT
      oh.*,
      c.course_code
    FROM office_hours oh
    JOIN courses c ON oh.course_id = c.id
    WHERE oh.is_deleted = false
    AND oh.course_id IN (
      SELECT course_id
      FROM user_courses
      WHERE user_id = ${id}
    )
    ORDER BY c.course_code, oh.day, oh.start_time
  `;

  return rows as unknown[] as OfficeHour[];
}

export async function getOfficeHoursByIds(ids: number[]): Promise<OfficeHour[]> {
  const rows = await sql`
    SELECT
      oh.*,
      c.course_code
    FROM office_hours oh
    LEFT JOIN courses c ON oh.course_id = c.course_id
    WHERE oh.is_deleted = false
    AND oh.id IN (${ids})
    ORDER BY c.course_code, oh.day, oh.start_time
  `;

  return rows as unknown[] as OfficeHour[];
}

export async function storeOfficeHours(data: OfficeHour[], userId: string): Promise<OfficeHour[]> {
  const rows = await sql`
    INSERT INTO office_hours ${sql(
      data.map((item) => ({
        course_id: item.course_id,
        host: item.host,
        mode: item.mode,
        link: item.link,
        location: item.location,
        start_time: item.start_time,
        end_time: item.end_time,
        day: item.day,
        updated_by: userId,
      })),
    )} RETURNING *
  `;

  return rows as unknown[] as OfficeHour[];
}

export async function updateOfficeHour(id: number, data: OfficeHour, userId: string): Promise<OfficeHour> {
  const fields = {
    ...data,
    updated_by: userId,
    updated_at: new Date(),
  };

  const rows = await sql`
    UPDATE office_hours
    SET ${sql(fields)}
    WHERE id = ${id} AND is_deleted = false
    RETURNING *
  `;

  return rows[0] as OfficeHour;
}

export async function deleteOfficeHours(ids: number[], userId: string): Promise<{ affectedRows: number }> {
  if (ids.length === 0) {
    return { affectedRows: 0 }; // No IDs to update
  }

  const rows = await sql`
    UPDATE office_hours
    SET is_deleted = true, updated_by = ${userId}
    WHERE id IN (${sql(ids)}) AND is_deleted = false
  `;

  return { affectedRows: rows.count };
}

export async function getUsersByCourseId(courseId: number): Promise<{ email: string }[]> {
  const rows = await sql`
    SELECT u.email FROM users u
    JOIN user_courses uc ON u.id = uc.user_id
    WHERE uc.course_id = ${courseId}
  `;

  return rows as unknown[] as { email: string }[];
}
