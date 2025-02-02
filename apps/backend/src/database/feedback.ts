import sql from "@/database";
import type { Feedback } from "@/schemas/feedback";

export async function getAllFeedback(): Promise<Feedback[]> {
  const rows = await sql`SELECT * FROM feedback`;
  return rows as unknown[] as Feedback[];
}

export async function createFeedback(userId: string, rating: number, content: string): Promise<void> {
  await sql`
    INSERT INTO feedback (user_id, rating, content)
    VALUES (${userId}, ${rating}, ${content})
  `;
}
