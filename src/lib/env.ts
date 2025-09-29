// Centralized env reader with runtime guards
const requiredServer = ['DATABASE_URL'];

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  NEXT_PUBLIC_BASE_URL:
    process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL,
};

export function assertServerEnv() {
  for (const key of requiredServer) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }
}
