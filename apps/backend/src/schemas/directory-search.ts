import { z } from "zod";

export const DirectorySearchSchema = z.object({
  first_name: z.string().optional().default(""),
  last_name: z.string().optional().default(""),
  email: z.string().optional().default(""),
  type: z.string(),
});

export type DirectorySearchParams = z.infer<typeof DirectorySearchSchema>;
