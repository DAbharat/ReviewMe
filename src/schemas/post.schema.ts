import { z } from "zod";
import { urlSchema } from "./_helper.schema";

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title too short")
    .max(100, "Title too long"),

  description: z
    .string()
    .trim()
    .max(2000, "Description too long")
    .optional(),

  imageUrl: urlSchema,
  imagePublicId: z.string().trim().optional(),
  categories: z
  .array(
    z.enum([
      "Product",
      "Series",
      "Movie",
      "App",
      "Game",
      "Sport",
      "Technology",
      "Celebrity",
      "Other",
    ])
  )
  .min(1)
  .optional(),

});

export type PostInput = z.infer<typeof postSchema>;
