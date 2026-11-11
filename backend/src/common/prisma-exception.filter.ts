import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

const STATUS_BY_CODE: Record<string, { status: HttpStatus; message: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: 'Resource already exists' },
  P2003: { status: HttpStatus.BAD_REQUEST, message: 'Related resource does not exist' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Resource not found' },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const mapped = STATUS_BY_CODE[exception.code];
    if (!mapped) throw exception;

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(mapped.status)
      .json({ statusCode: mapped.status, message: mapped.message, code: exception.code });
  }
}
