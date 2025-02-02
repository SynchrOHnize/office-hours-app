import { z } from "zod";

export const UserCourseSchema = z.object({
  user_id: z.string(),
  course_id: z.number().int(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type UserCourse = z.infer<typeof UserCourseSchema>;
