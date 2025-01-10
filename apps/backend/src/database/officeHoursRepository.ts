import { OfficeHour, OfficeHourSchema } from "@/common/schemas/officeHoursSchema";
import { FieldPacket, Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { parse } from "date-fns";

export class OfficeHourRepository {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db; // Set the db connection to a class property
  }
  async getAllOfficeHours(): Promise<OfficeHour[]> {
    const [rows] = await this.db.query(`
      SELECT 
        office_hours.*, 
        courses.course_code 
      FROM office_hours 
      LEFT JOIN courses ON office_hours.course_id = courses.course_id 
      WHERE office_hours.is_deleted = false
      ORDER BY courses.course_code, office_hours.day, office_hours.start_time
    `);

    return rows as OfficeHour[];
  }

  async getOfficeHoursByUserId(id: string): Promise<OfficeHour[]> {
    const [rows]: [any[], FieldPacket[]] = await this.db.query(
      `
      SELECT 
        oh.*,
        c.course_code
      FROM office_hours oh
      JOIN courses c ON oh.course_id = c.course_id
      WHERE oh.is_deleted = false
      AND oh.course_id IN (
        SELECT course_id 
        FROM user_courses 
        WHERE user_id = ?
      )
      ORDER BY c.course_code, oh.day, oh.start_time
    `,
      [id]
    );

    return rows as OfficeHour[];
  }

  async getOfficeHoursByIds(ids: number[]): Promise<OfficeHour[]> {
    const placeholders = ids.map(() => "?").join(",");

    const [rows]: [any[], FieldPacket[]] = await this.db.query(
      `
      SELECT 
        oh.*,
        c.course_code
      FROM office_hours oh
      LEFT JOIN courses c ON oh.course_id = c.course_id
      WHERE oh.is_deleted = false
      AND oh.id IN (${placeholders})
      ORDER BY c.course_code, oh.day, oh.start_time
      `,
      ids
    );

    return rows as OfficeHour[];
  }

  async storeOfficeHour(data: z.infer<typeof OfficeHourSchema>, userId: string): Promise<OfficeHour> {
    const query = `
      INSERT INTO office_hours (
        course_id, 
        host, 
        mode, 
        link, 
        location, 
        start_time, 
        end_time, 
        day,
        updated_at,
        updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "2024-01-01 00:00:00", ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(query, [
      data.course_id,
      data.host,
      data.mode,
      data.link,
      data.location,
      data.start_time,
      data.end_time,
      data.day,
      userId,
    ]);

    const [rows] = await this.db.execute<RowDataPacket[]>("SELECT * FROM office_hours WHERE id = ?", [result.insertId]);

    if (!rows || rows.length === 0) {
      throw new Error("Office hour was created but could not be retrieved");
    }

    return rows[0] as OfficeHour;
  }

  async storeListOfficeHours(officeHourList: z.infer<typeof OfficeHourSchema>[], userId: string): Promise<OfficeHour[]> {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const createdOfficeHours: OfficeHour[] = [];

      for (const officeHour of officeHourList) {
        const created = await this.storeOfficeHour(officeHour, userId);
        createdOfficeHours.push(created);
      }

      await connection.commit();
      return createdOfficeHours;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateOfficeHour(id: number, data: z.infer<typeof OfficeHourSchema>, userId: string): Promise<OfficeHour> {
    // Check if record exists
    const [existing] = await this.db.execute<RowDataPacket[]>("SELECT * FROM office_hours WHERE id = ? AND is_deleted = false", [id]);

    if (!existing || existing.length === 0) {
      throw new Error("Office hour not found or has been deleted");
    }

    // Build update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      throw new Error("No valid fields provided for update");
    }

    // Add updated_by
    updateFields.push("updated_by = ?");
    updateValues.push(userId);

    // Add the ID to values array
    updateValues.push(id);

    const updateQuery = `
        UPDATE office_hours 
        SET ${updateFields.join(", ")}
        WHERE id = ? AND is_deleted = false
    `;

    await this.db.execute(updateQuery, updateValues);

    // Fetch updated record
    const [updated] = await this.db.execute<RowDataPacket[]>("SELECT * FROM office_hours WHERE id = ?", [id]);

    return updated[0] as OfficeHour;
  }

  async deleteOfficeHours(ids: number[], userId: string): Promise<{ affectedRows: number }> {
    if (ids.length === 0) {
      return { affectedRows: 0 }; // No IDs to update
    }

    // Dynamically create placeholders for the `IN` clause
    const placeholders = ids.map(() => "?").join(","); // e.g., "?, ?, ?"
    const query = `UPDATE office_hours SET is_deleted = true, updated_by = ? WHERE id IN (${placeholders}) AND is_deleted = false`;

    // Combine userId and ids into a single array for the query parameters
    const params = [userId, ...ids];

    // Execute the query
    const [result] = await this.db.execute<ResultSetHeader>(query, params);

    return { affectedRows: result.affectedRows };
  }
}
