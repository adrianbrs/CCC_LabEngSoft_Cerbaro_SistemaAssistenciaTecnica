import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiError extends HttpException {
  constructor(code: string, message: string, statusCode: HttpStatus) {
    super(
      {
        code,
        message,
        statusCode,
      },
      statusCode,
    );
  }
}
