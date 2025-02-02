import { z } from "zod";

export const FeedbackSchema = z.object({
  id: z.number().int(),
  user_id: z.string(),
  rating: z.number().int(),
  content: z.string(),
  created_at: z.date(), // Timestamp for when the user was created in your system.
  updated_at: z.date(), // Timestamp for the last update.
});

export type Feedback = z.infer<typeof FeedbackSchema>;

export const PostFeedbackSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Content cannot be empty"), // `content` field from the JSON body
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"), // `rating` field (integer between 1 and 5)
  }),
});
