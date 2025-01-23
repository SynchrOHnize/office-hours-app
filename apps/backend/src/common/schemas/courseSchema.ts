import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const CourseSchema = z.object({
  course_code: z.string(),
  title: z.string(),
  instructor: z.string(),
});

export type Course = z.infer<typeof CourseSchema>;


export const StoreCourseSchema = z.object({body: CourseSchema});
