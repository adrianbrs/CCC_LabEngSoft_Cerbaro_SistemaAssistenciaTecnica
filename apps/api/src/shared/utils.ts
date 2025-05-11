import { timingSafeEqual } from 'node:crypto';

export const safeCompareStrings = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  const aBuffer = Buffer.from(a, 'utf8');
  const bBuffer = Buffer.from(b, 'utf8');

  return timingSafeEqual(aBuffer, bBuffer);
};
