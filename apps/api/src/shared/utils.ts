import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ReflectableDecorator } from '@nestjs/core';
import { randomBytes, timingSafeEqual } from 'node:crypto';

export const safeCompareStrings = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  const aBuffer = Buffer.from(a, 'utf8');
  const bBuffer = Buffer.from(b, 'utf8');

  return timingSafeEqual(aBuffer, bBuffer);
};

export const generateHexToken = (length: number): string =>
  Buffer.from(randomBytes(length)).toString('hex');

export const replaceMustacheVariables = (str: string, data: object): string => {
  return str.replace(/{{\s?([\w\s]*)\s?}}/g, (_, key: string) => {
    const trimmedKey = key.trim();
    return data[trimmedKey] !== undefined
      ? String(data[trimmedKey])
      : `{{${trimmedKey}}}`;
  });
};

/**
 * Helper function to create a `ReflectableDecorator` that applies other decorators
 * and sets metadata with the specific key.
 */
export function createDecoratorsWithKey<TParam, TTransformed>(
  key: string,
  factory: (
    opts: TParam,
    key: string,
  ) =>
    | (MethodDecorator & ClassDecorator)
    | Array<MethodDecorator & ClassDecorator>,
): ReflectableDecorator<TParam, TTransformed> {
  const decoratorFn = ((opts: TParam) => {
    const decorators = factory(opts, key);
    return applyDecorators(
      SetMetadata(key, opts),
      ...(Array.isArray(decorators) ? decorators : [decorators]),
    );
  }) as ReflectableDecorator<TParam, TTransformed>;
  decoratorFn.KEY = key;
  return decoratorFn;
}
