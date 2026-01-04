import { z } from "zod";
import { emailSchema, passwordSchema } from "../_helper.schema";
import { usernameValidation } from "./signUp.schema";


export const signinSchema = z.object({
  username: usernameValidation.optional(),
  email: emailSchema.optional(),
  password: passwordSchema,
})
.refine(data => data.email || data.username, {
  message: "Either email or username is required",
})

export type SigninInput = z.infer<typeof signinSchema>;
