import { z } from "zod";
import { registerSchema } from "@/src/lib/forms/schemas/auth.schema";
import {
  defaultRegisterFormValues,
  toRegisterSubmissionValues,
  type RegisterFormFields,
} from "../utils/register-form-values";

export const registerFormSchema = z
  .object({
    role: z.enum(["CLIENT", "TRANSPORTER"]),
    email: z.string(),
    password: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    displayName: z.string(),
  })
  .superRefine((values, context) => {
    const parsed = registerSchema.safeParse(toRegisterSubmissionValues(values));

    if (parsed.success) {
      return;
    }

    for (const issue of parsed.error.issues) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: issue.message,
        path: issue.path,
      });
    }
  });

export const registerFormDefaultValues: RegisterFormFields =
  defaultRegisterFormValues;
