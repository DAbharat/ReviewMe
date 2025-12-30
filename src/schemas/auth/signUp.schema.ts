import { z } from "zod";
import { emailSchema, passwordSchema } from "../_helper.schema";

export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username too long"),

  email: emailSchema,

  password: passwordSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;
