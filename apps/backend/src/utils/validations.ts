import { z } from "zod";

export const idSchema = z
  .string()
  .transform(Number)
  .refine((num) => !Number.isNaN(num), "ID must be a numeric value")
  .refine((num) => num > 0, "ID must be a positive number");
