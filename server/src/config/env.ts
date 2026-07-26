import { z } from "zod";

// Load dotenv synchronously before anything else reads process.env.
// This file is imported first by server.ts, so it runs before any
// other module that might access process.env (prisma, services, etc.)
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().positive().default(3000),

  CLIENT_URL: z.url().default("http://localhost:5173"),

  DATABASE_URL: z
    .string()
    .startsWith(
      "postgresql://",
      "DATABASE_URL must be a PostgreSQL connection string",
    ),

  HASH_SALT: z.coerce.number().positive().default(10),
  BCRYPT_ROUNDS: z.coerce.number().positive().default(12),

  JWT_ACCESS_SECRET: z
    .string()
    .min(10, "JWT_ACCESS_SECRET must be at least 10 characters"),

  JWT_REFRESH_SECRET: z
    .string()
    .min(10, "JWT_REFRESH_SECRET must be at least 10 characters"),

  SMTP_USER: z.email("SMTP_USER must be a valid email address"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),
  EMAIL_FROM: z.email("EMAIL_FROM must be a valid email address"),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (e) {
  if (e instanceof z.ZodError) {
    console.error("\n❌ Invalid environment variables:\n");
    e.issues.forEach((issue) => {
      const path = issue.path.join(".");
      console.error(`  ${path}: ${issue.message}`);
    });
    console.error("");
    process.exit(1);
  }
  throw e;
}

export const isProd = () => env.NODE_ENV === "production";
export const isDev = () => env.NODE_ENV === "development";
export const isTest = () => env.NODE_ENV === "test";

export { env };
