import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ApiError } from '../common/api-error.js';
import { AppConfigService } from '../config/app-config.service.js';

export const SPEECH_LANGUAGES = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' } as const;
export type SpeechLanguage = keyof typeof SPEECH_LANGUAGES;

export const SPEECH_SAMPLE_RATE = 16_000;
export const MAX_AUDIO_BYTES = 1024 * 1024;

const RECOGNIZE_URL = 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize';
const REQUEST_TIMEOUT_MS = 20_000;

type RecognizeResponse = { result?: string; error_code?: string; error_message?: string };

@Injectable()
export class SpeechService {
  private readonly logger = new Logger(SpeechService.name);

  constructor(private readonly config: AppConfigService) {}

  async transcribe(audio: Buffer, language: SpeechLanguage) {
    const { apiKey, folderId } = this.config.speech;
    if (!apiKey) throw new ApiError(HttpStatus.SERVICE_UNAVAILABLE, 'SPEECH_DISABLED', 'Speech recognition is not configured');
    if (audio.length === 0) throw new ApiError(HttpStatus.BAD_REQUEST, 'SPEECH_EMPTY', 'The recording is empty');
    if (audio.length > MAX_AUDIO_BYTES) throw new ApiError(HttpStatus.PAYLOAD_TOO_LARGE, 'SPEECH_TOO_LONG', 'The recording is too long');

    const params = new URLSearchParams({
      lang: SPEECH_LANGUAGES[language],
      format: 'lpcm',
      sampleRateHertz: String(SPEECH_SAMPLE_RATE),
      ...(folderId ? { folderId } : {}),
    });

    const response = await fetch(`${RECOGNIZE_URL}?${params}`, {
      method: 'POST',
      headers: { authorization: `Api-Key ${apiKey}`, 'content-type': 'application/octet-stream' },
      body: new Uint8Array(audio),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }).catch(() => null);

    const payload = (await response?.json().catch(() => null)) as RecognizeResponse | null;
    if (!response?.ok || !payload) {
      this.logger.warn(`SpeechKit failed: ${response?.status ?? 'network'} ${payload?.error_code ?? ''} ${payload?.error_message ?? ''}`);
      throw new ApiError(HttpStatus.BAD_GATEWAY, 'SPEECH_FAILED', 'Speech recognition failed');
    }
    return { text: (payload.result ?? '').trim() };
  }
}
