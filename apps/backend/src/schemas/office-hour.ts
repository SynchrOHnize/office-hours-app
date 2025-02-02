import { z } from "zod";

const timeSchema = z.string().refine((time) => !isNaN(Date.parse(`2000/01/01 ${time}`)), "Must be a valid time");

export const OfficeHourSchema = z
  .object({
    course_id: z.number().int(),
    host: z.string().min(1, "Host name is required"),
    day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
    start_time: timeSchema,
    end_time: timeSchema,
    mode: z.enum(["in-person", "remote", "hybrid"]),
    location: z.union([
      z
        .string()
        .regex(/^[A-Z]+[0-9]+$/, "Location must be uppercase letters followed by numbers (e.g., MALA5200)")
        .optional(),
      z.string().length(0),
    ]),
    link: z.union([z.string().url(), z.string().length(0)]).optional(),
  })
  .superRefine((data, ctx) => {
    const requireLocation = ["in-person", "hybrid"].includes(data.mode) && !data.location;
    const requireLink = ["remote", "hybrid"].includes(data.mode) && !data.link;

    if (requireLocation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Location is required for ${data.mode} mode`,
        path: ["location"],
      });
    }

    if (requireLink) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Link is required for ${data.mode} mode`,
        path: ["link"],
      });
    }
  });

export type OfficeHour = z.infer<typeof OfficeHourSchema>;

export const PostOfficeHourSchema = z.object({
  body: OfficeHourSchema,
});

export const PostListOfficeHourSchema = z.object({
  body: z.array(OfficeHourSchema),
});
