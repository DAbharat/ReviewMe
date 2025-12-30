import { z } from "zod";
import { objectIdSchema } from "./_helper.schema";

export const commentSchema = z.object({
  postId: objectIdSchema,

  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment too long"),
});

export type CommentInput = z.infer<typeof commentSchema>;
