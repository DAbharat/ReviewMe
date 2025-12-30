import { z } from "zod";
import { emailSchema } from "../_helper.schema";

export const verifyStatusSchema = z.object({
  email: emailSchema,
  verifyCode: z
    .string()
    .length(5, "Verification code must be 5 digits"),
});

export type VerifyStatusInput = z.infer<typeof verifyStatusSchema>;
