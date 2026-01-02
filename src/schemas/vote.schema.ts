import { z } from "zod";
import { objectIdSchema } from "./_helper.schema";

export const voteSchema = z.object({
  postId: objectIdSchema,

  option: z.enum(["Worth it", "Not Worth it", "Maybe"]),
});

export type VoteInput = z.infer<typeof voteSchema>;
