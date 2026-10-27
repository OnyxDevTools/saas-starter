// filename: lib/project.ts
import { z } from "zod";

export const projectIdentitySchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[^\u0000-\u001f\u007f]+$/, "Use a printable project name."),
  slug: z
    .string()
    .min(1)
    .max(63)
    .regex(
      /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and single hyphens; start with a letter.",
    ),
});
