import { z } from "zod";

export const CourseSchema = z.object({
  course_code: z.string(),
  title: z.string(),
  instructor: z.string(),
});

export type Course = z.infer<typeof CourseSchema>;

export const StoreCourseSchema = z.object({
  body: CourseSchema,
});
