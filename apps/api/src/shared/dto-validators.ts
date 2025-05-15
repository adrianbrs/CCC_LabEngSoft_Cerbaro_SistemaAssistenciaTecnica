import { isStrongPassword, isValidCPF } from '@musat/core';
import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Custom decorator to validate CPF (Cadastro de Pessoas Físicas) numbers.
 */
export const IsCPF = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: {
        message: '$property is not a valid CPF',
        ...validationOptions,
      },
      constraints: [],
      validator: {
        validate(value: string) {
          return isValidCPF(value);
        },
      },
    });
  };
};

/**
 * Custom decorator to validate if the password is strong enough.
 */
export const IsStrongPassword = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: {
        message: '$property is not strong enough',
        ...validationOptions,
      },
      constraints: [],
      validator: {
        validate(value: string) {
          return isStrongPassword(value);
        },
      },
    });
  };
};
