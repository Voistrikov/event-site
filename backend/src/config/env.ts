import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET:   z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  PORT:         z.coerce.number().int().positive().default(3000),
  NODE_ENV:     z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('https://localhost:5173'),
  SSL_KEY_PATH:  z.string().optional(),
  SSL_CERT_PATH: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:\n', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: Env = parsed.data;
