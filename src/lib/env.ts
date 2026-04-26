import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE: z.string().url("NEXT_PUBLIC_API_BASE must be a valid URL"),
});

function validateEnv() {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
  });

  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Missing or invalid environment variables:\n${missing}`);
  }

  return result.data;
}

export const env = validateEnv();
