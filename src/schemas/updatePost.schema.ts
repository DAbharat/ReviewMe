import { z } from "zod";
import { urlSchema } from "./_helper.schema";
import { postSchema } from "./post.schema";


export const updatePostSchema = postSchema
  .partial()
  .refine(obj => Object.keys(obj).length > 0, { message: "At least one field is required" });


export type updatePostInput = z.infer<typeof updatePostSchema>;
