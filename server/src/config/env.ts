import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL is mandatory. Please define it in your .env file.'
  }).url('DATABASE_URL must be a valid PostgreSQL connection URL'),
  JWT_SECRET: z.string({
    required_error: 'JWT_SECRET is mandatory. Never use fallback secrets in production.'
  }).min(16, 'JWT_SECRET must be at least 16 characters long for cryptographic security'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  GEMINI_API_KEY: z.string().optional()
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('FATAL: Invalid Environment Configuration:');
    result.error.errors.forEach((err) => {
      console.error(`   - [${err.path.join('.')}] : ${err.message}`);
    });
    console.error('\nPlease check your server/.env file or refer to server/.env.example\n');
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
