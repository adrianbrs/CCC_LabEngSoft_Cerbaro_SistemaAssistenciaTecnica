import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Constructor } from 'type-fest';
import {
  Brackets,
  DataSource,
  EntitySchema,
  ObjectLiteral,
  ObjectType,
  SelectQueryBuilder,
} from 'typeorm';

export type UniqueValidatorEntity<E> = ObjectType<E> | EntitySchema<E> | string;

export type UniqueValidatorConstraints<E> = [
  UniqueValidatorEntity<E>,
  (
    | ((
        validationArguments: ValidationArguments,
      ) =>
        | string
        | ObjectLiteral
        | Brackets
        | ObjectLiteral[]
        | ((qb: SelectQueryBuilder<ObjectLiteral>) => string))
    | (keyof E & string)
  ),
];

interface UniqueValidatorArguments<E> extends ValidationArguments {
  constraints: UniqueValidatorConstraints<E>;
}

@ValidatorConstraint({ name: 'IsUnique', async: true })
@Injectable()
export class UniqueValidator implements ValidatorConstraintInterface {
  constructor(private readonly ds: DataSource) {}

  async validate<E extends ObjectLiteral>(
    value: string,
    args: UniqueValidatorArguments<E>,
  ): Promise<boolean> {
    const [entity, cond] = args.constraints;
    const repository = this.ds.getRepository(entity);
    const exists = await repository
      .createQueryBuilder()
      .where(
        typeof cond === 'function'
          ? cond(args)
          : {
              [cond || args.property]: value,
            },
      )
      .getExists();

    return !exists;
  }

  defaultMessage<E extends ObjectLiteral>(args: UniqueValidatorArguments<E>) {
    const [EntityClass] = args.constraints;
    const name = (EntityClass as Constructor<any>).name || 'Entity';
    return `${name} with the same '$property' criteria already exist`;
  }
}

export const IsUnique = <E extends ObjectLiteral>(
  target: UniqueValidatorEntity<E> | UniqueValidatorConstraints<E>,
  options?: ValidationOptions,
) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: Array.isArray(target) ? target : [target],
      validator: UniqueValidator,
    });
  };
};
