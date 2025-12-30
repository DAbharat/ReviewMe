import { z } from "zod";
import { emailSchema, passwordSchema } from "../_helper.schema";

export const signinSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SigninInput = z.infer<typeof signinSchema>;
