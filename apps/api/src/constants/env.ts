// APP
export const PORT = parseInt(process.env.PORT ?? '3000', 10);
export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const IS_PROD = NODE_ENV === 'production';
export const IS_DEV = NODE_ENV === 'development';
export const IS_TEST = NODE_ENV === 'test';
export const VERSION = process.env.VERSION;

// FRONTEND
export const FRONTEND_URL = process.env.FRONTEND_URL;

// SECURITY
export const BCRYPT_SALT_ROUNDS = parseInt(
  process.env.BCRYPT_SALT_ROUNDS || '10',
  10,
);
export const SESSION_SECRET = process.env.SESSION_SECRET;
export const SESSION_NAME = process.env.SESSION_NAME || 'MUSAT_SID';
