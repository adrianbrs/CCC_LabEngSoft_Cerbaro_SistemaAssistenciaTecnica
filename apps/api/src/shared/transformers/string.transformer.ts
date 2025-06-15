import { Transform, TransformOptions } from 'class-transformer';

export interface TrimOptions {
  strategy?: 'start' | 'end' | 'both';
}

export const Trim = (
  options?: TrimOptions,
  transformOptions?: TransformOptions,
) =>
  Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value as unknown;
    }

    const { strategy } = options ?? {};

    if (strategy === 'start') {
      return value.trimStart();
    }
    if (strategy === 'end') {
      return value.trimEnd();
    }
    return value.trim();
  }, transformOptions);
