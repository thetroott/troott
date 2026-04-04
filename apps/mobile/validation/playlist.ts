import { z } from "zod";

export const PlayListValidationSchema = z.object({
  title: z
    .string()
    .min(4, {
      message: "Title must be at least 4 characters long",
    })
    .max(50, {
      message: "Title must not exceed 50 characters",
    })
    .refine(
      (value) => {
        // Check if the title is not just whitespace
        return value.trim().length > 0;
      },
      {
        message: "Title cannot be empty or just whitespace",
      },
    ),
  description: z
    .string()
    .max(200, {
      message: "Description must not exceed 200 characters",
    })
    .optional(),
  image: z
    .string()
    .url({
      message: "Image must be a valid URL",
    })
    .optional(),
  collaborative: z.boolean().optional(),
  private: z.boolean().optional(),
});

export type PlayListValidationSchemaType = z.infer<
  typeof PlayListValidationSchema
>;
