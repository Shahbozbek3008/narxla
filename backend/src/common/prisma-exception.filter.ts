import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

type MappedError = { status: HttpStatus; message: string };

const STATUS_BY_CODE: Record<string, MappedError> = {
  P2002: { status: HttpStatus.CONFLICT, message: 'Resource already exists' },
  P2003: { status: HttpStatus.BAD_REQUEST, message: 'Related resource does not exist' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Resource not found' },
};

const INTERNAL: MappedError = { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' };

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const mapped = STATUS_BY_CODE[exception.code];
    if (!mapped) this.logger.error(`Unhandled Prisma error ${exception.code}: ${exception.message}`, exception.stack);

    const { status, message } = mapped ?? INTERNAL;
    host.switchToHttp().getResponse<Response>().status(status).json({ statusCode: status, message, code: exception.code });
  }
}
