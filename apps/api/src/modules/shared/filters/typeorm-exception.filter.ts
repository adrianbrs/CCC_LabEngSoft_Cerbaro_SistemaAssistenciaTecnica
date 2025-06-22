import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { TypeORMError, EntityNotFoundError, EntityTarget } from 'typeorm';
import * as _ from 'lodash-es';

@Catch(TypeORMError)
export class TypeormExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter<TypeORMError>
{
  private readonly logger = new Logger(TypeormExceptionFilter.name);

  catch(error: TypeORMError, host: ArgumentsHost) {
    const entityClass = this.getEntityClass(error);
    const entityName = entityClass ? this.getEntityName(entityClass) : 'Entity';
    const entityCode = _.snakeCase(entityName).toUpperCase();
    let exception: HttpException = new InternalServerErrorException();

    if (error instanceof EntityNotFoundError) {
      exception = new NotFoundException({
        code: `${entityCode}_NOT_FOUND`,
        message: `${entityName} not found`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (exception instanceof InternalServerErrorException) {
      this.logger.error(`TypeORM Error: ${error.message}`);
    } else {
      this.logger.debug(`TypeORM Error: ${error.message}`);
    }

    super.catch(exception, host);
  }

  private getEntityClass(error: TypeORMError): EntityTarget<unknown> | null {
    if ('entityClass' in error) {
      return error.entityClass as EntityTarget<unknown>;
    }
    return null;
  }

  private getEntityName(target: EntityTarget<unknown>): string {
    if (typeof target === 'string') {
      return target;
    }

    if (typeof target === 'object' && 'options' in target) {
      return target.options.name;
    }

    return target.name;
  }
}
