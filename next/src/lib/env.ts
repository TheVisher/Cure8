const requiredClient = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const requiredServer = [
  "DATABASE_URL",
  "DIRECT_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

type EnvKey = (typeof requiredClient)[number] | (typeof requiredServer)[number];

type EnvShape = Record<EnvKey, string> & {
  NODE_ENV: string;
};

function readEnv(): EnvShape {
  const env: Partial<EnvShape> = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
  };

  for (const key of [...requiredClient, ...requiredServer]) {
    const value = process.env[key];
    if (value) env[key] = value;
  }

  return env as EnvShape;
}

export const env = readEnv();

export function assertServerEnv() {
  for (const key of requiredServer) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }
}

export function assertClientEnv() {
  for (const key of requiredClient) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }
}
