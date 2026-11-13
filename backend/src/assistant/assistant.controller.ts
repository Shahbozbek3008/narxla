import { Body, Controller, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBadGatewayResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import { ApiError } from '../common/api-error.js';
import { SPEECH_LANGUAGES, SpeechService } from './speech.service.js';

const MINUTE_MS = 60_000;

const transcribeQuerySchema = z.object({
  lang: z.enum(Object.keys(SPEECH_LANGUAGES) as [keyof typeof SPEECH_LANGUAGES, ...(keyof typeof SPEECH_LANGUAGES)[]]).default('uz'),
});

@ApiTags('assistant')
@Controller('assistant')
export class AssistantController {
  constructor(private readonly speech: SpeechService) {}

  @Post('transcribe')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 12, ttl: MINUTE_MS } })
  @ApiOkResponse({ description: 'Transcribes 16 kHz mono 16-bit PCM audio with Yandex SpeechKit' })
  @ApiBadGatewayResponse({ description: 'The speech provider failed' })
  transcribe(@Query({ schema: transcribeQuerySchema }) { lang }: z.infer<typeof transcribeQuerySchema>, @Body() body: unknown) {
    if (!Buffer.isBuffer(body)) throw new ApiError(HttpStatus.UNSUPPORTED_MEDIA_TYPE, 'SPEECH_FORMAT', 'Send raw audio as application/octet-stream');
    return this.speech.transcribe(body, lang);
  }
}
