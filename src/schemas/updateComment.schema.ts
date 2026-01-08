import { z } from "zod";
import { commentSchema } from "./comment.schema";
import { objectIdSchema } from "./_helper.schema";

export const updateCommentSchema = z.object({
  commentId: objectIdSchema,
  content: commentSchema.shape.content,
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
