import { Request } from 'express';
import { randomBytes } from 'node:crypto';

const TOKEN_SIZE = parseInt(process.env.CSRF_TOKEN_SIZE || '64', 10);

export const updateCsrfToken = (req: Request): string => {
  const newToken = randomBytes(TOKEN_SIZE).toString('base64');
  req.session.csrfToken = newToken;
  return newToken;
};
