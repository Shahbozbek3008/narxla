import { ApiBody, type SchemaObject } from '@nestjs/swagger';
import { z } from 'zod';

export function ApiZodBody(schema: z.ZodType) {
  return ApiBody({ schema: z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' }) as SchemaObject });
}
