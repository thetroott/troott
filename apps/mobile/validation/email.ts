import { z } from "zod";

/**
 * @name EmailSchema
 * @description
 * Zod schema for validating a single email address.
 * This schema is primarily used in forms where a user needs to submit their email
 * to initiate a process, such as a "enter email", "forgot password" or "reset password" flow.
 * It validates that the input is a string and that it is in a valid email format.
 *
 * @returns {EmailSchemaType} A Zod object schema containing a single email field.
 */
export const EmailSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

/**
 * @description
 * Infers the TypeScript type from the EmailSchema.
 * Represents the shape of the data after successful validation.
 * @property {string} email - The validated email address string.
 */
export type EmailSchemaType = z.infer<typeof EmailSchema>;