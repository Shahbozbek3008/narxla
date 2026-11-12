import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiError extends HttpException {
  constructor(
    status: HttpStatus,
    readonly code: string,
    message: string,
    details: Record<string, unknown> = {},
  ) {
    super({ statusCode: status, code, message, ...details }, status);
  }
}
