import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { Constructor } from 'type-fest';
import { isES6Class } from '../utils';

/**
 * Use this decorator in controller handlers to support nested query parameters
 * in Swagger UI.
 */
export function ApiNestedQuery(dto: Type) {
  const constructor = dto.prototype as Constructor<Type>;
  const metadata = Reflect.getMetadata(
    'swagger/apiModelPropertiesArray',
    constructor,
  ) as string[];
  const properties = metadata.map((prop) => prop.substring(1));

  const decorators = properties
    .map((property) => {
      const propertyType = Reflect.getMetadata(
        'design:type',
        constructor,
        property,
      ) as Type;

      if (!isES6Class(propertyType)) {
        return null;
      }

      return [
        ApiExtraModels(propertyType),
        ApiQuery({
          required: false,
          name: property,
          style: 'deepObject',
          explode: true,
          type: 'object',
          examples: {
            '-': {},
          },
          schema: {
            $ref: getSchemaPath(propertyType),
          },
        }),
      ];
    })
    .filter((decorators) => decorators !== null)
    .flat();

  return applyDecorators(...decorators);
}
