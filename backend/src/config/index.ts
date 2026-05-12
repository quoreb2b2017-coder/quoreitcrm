import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dist/config/index.js → backend root is two levels up
const backendDir = path.resolve(__dirname, '../..');
const backendEnv = path.join(backendDir, '.env');
// Also check backend/ subfolder relative to cwd (when run from repo root)
const cwdBackendEnv = path.join(process.cwd(), 'backend', '.env');
const cwdEnv = path.join(process.cwd(), '.env');

if (fs.existsSync(backendEnv)) {
  dotenv.config({ path: backendEnv, override: true });
} else if (fs.existsSync(cwdBackendEnv)) {
  dotenv.config({ path: cwdBackendEnv, override: true });
} else {
  dotenv.config({ path: cwdEnv, override: false });
}

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
};

const getEnvOptional = (key: string, defaultValue?: string): string | undefined =>
  process.env[key] ?? defaultValue;

export const config = {
  nodeEnv: getEnvOptional('NODE_ENV', 'development'),
  port: parseInt(getEnvOptional('PORT', '4000') ?? '4000', 10),
  apiPrefix: getEnvOptional('API_PREFIX', '/api/v1') ?? '/api/v1',

  mongodb: {
    uri: getEnv('MONGODB_URI'),
  },

  jwt: {
    secret: getEnv('JWT_SECRET'),
    expiresIn: getEnvOptional('JWT_EXPIRES_IN', '7d'),
    refreshExpiresIn: getEnvOptional('JWT_REFRESH_EXPIRES_IN', '30d'),
  },

  cloudinary: {
    cloudName: getEnvOptional('CLOUDINARY_CLOUD_NAME'),
    apiKey: getEnvOptional('CLOUDINARY_API_KEY'),
    apiSecret: getEnvOptional('CLOUDINARY_API_SECRET'),
  },

  resend: {
    apiKey: getEnvOptional('RESEND_API_KEY'),
    fromEmail: getEnvOptional('RESEND_FROM_EMAIL', 'noreply@example.com'),
  },

  frontend: {
    url: getEnvOptional('FRONTEND_URL', 'http://localhost:3000'),
    /** Comma-separated list of allowed origins, or single origin. Defaults to 3000 and 3001 in dev. */
    origins:
      getEnvOptional(
        'CORS_ORIGINS',
        'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001'
      )
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ],
  },

  google: {
    clientId: getEnvOptional('GOOGLE_CLIENT_ID'),
    clientSecret: getEnvOptional('GOOGLE_CLIENT_SECRET'),
    redirectUri: getEnvOptional('GOOGLE_REDIRECT_URI'),
  },
} as const;

export type Config = typeof config;
