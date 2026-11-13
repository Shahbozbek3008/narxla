'use client';

import { RotateCcw, ShieldCheck, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isApiError } from '@/lib/api/client';
import { assistantApi } from '@/lib/api/endpoints';
import type { Chip } from '@/lib/assistant/respond';
import { useAssistant } from '@/store/assistant';
import { usePriceBook } from '@/store/prices';
import { Composer } from './Composer';
import { AssistantAvatar, MessageList, useChipLabel } from './MessageList';
import { TARGET_SAMPLE_RATE, useVoiceRecorder } from './useVoiceRecorder';

const MIN_AUDIO_SECONDS = 0.4;
const EXAMPLE_CHIPS: Chip[] = [0, 1, 2].map((index) => ({ kind: 'example', index }));

type VoiceError = 'unsupported' | 'denied' | 'failed' | 'disabled' | 'empty' | 'transcribe';

const HEADER_BUTTON =
  'grid size-9 place-items-center rounded-full text-fg-2 transition-[background-color,color,scale] duration-150 hover:bg-surface-2 hover:text-fg active:scale-90';

export function AssistantPanel({ onClose }: { onClose: () => void }) {
  const t = useTranslations('app.assistant');
  const locale = useLocale();
  const book = usePriceBook();
  const { messages, thinking, send, askQuote, reset } = useAssistant();
  const chipLabel = useChipLabel();
  const scroller = useRef<HTMLDivElement>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<VoiceError | null>(null);

  const sendText = useCallback((text: string, voice = false) => send(text, book, voice), [send, book]);

  const onAudio = useCallback(
    (pcm: Int16Array) => {
      if (pcm.length < TARGET_SAMPLE_RATE * MIN_AUDIO_SECONDS) return setVoiceError('empty');
      setTranscribing(true);
      assistantApi
        .transcribe(pcm, locale)
        .then(({ text }) => (text ? sendText(text, true) : setVoiceError('empty')))
        .catch((error: unknown) => setVoiceError(isApiError(error, 'SPEECH_DISABLED') ? 'disabled' : 'transcribe'))
        .finally(() => setTranscribing(false));
    },
    [locale, sendText],
  );

  const recorder = useVoiceRecorder(onAudio);
  const error = voiceError ?? recorder.error;

  useEffect(() => {
    const element = scroller.current;
    if (element) element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
  }, [messages, transcribing, thinking]);

  const onChip = (chip: Chip) => {
    if (chip.kind === 'askQuote') askQuote(chipLabel(chip));
    else sendText(chipLabel(chip));
  };

  const startRecording = () => {
    setVoiceError(null);
    recorder.clearError();
    void recorder.start();
  };

  return (
    <div className="flex h-full flex-col bg-bg">
      <header className="flex items-center gap-3 border-b border-line bg-surface px-3 pt-[calc(10px+env(safe-area-inset-top))] pb-2.5 md:pt-2.5">
        <AssistantAvatar size={36} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base/5 font-semibold tracking-[-0.01em]">{t('title')}</p>
          <p className="flex items-center gap-1.5 text-xs/4 text-fg-3">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            {t('online')}
          </p>
        </div>
        {messages.length > 0 && (
          <button type="button" className={HEADER_BUTTON} aria-label={t('clear')} title={t('clear')} onClick={reset}>
            <RotateCcw size={17} strokeWidth={1.75} />
          </button>
        )}
        <button type="button" className={HEADER_BUTTON} aria-label={t('close')} onClick={onClose}>
          <X size={20} strokeWidth={1.75} />
        </button>
      </header>

      <div ref={scroller} className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center gap-4 py-4 text-center">
            <AssistantAvatar size={52} />
            <p className="max-w-[320px] text-[15px]/6 text-pretty text-fg-2">{t('greeting')}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs/5 font-medium text-success">
              <ShieldCheck size={13} strokeWidth={2} aria-hidden />
              {t('badge')}
            </span>
            <div className="flex w-full flex-col gap-2">
              <span className="text-xs text-fg-3">{t('examplesTitle')}</span>
              {EXAMPLE_CHIPS.map((chip, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onChip(chip)}
                  className="rounded-2xl border border-line bg-surface px-4 py-3 text-left text-[15px]/[22px] text-fg transition-[border-color,scale] duration-150 hover:border-accent active:scale-[.98]"
                >
                  {chipLabel(chip)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <MessageList messages={messages} onChip={onChip} />
        )}
      </div>

      <Composer
        busy={transcribing}
        error={error ? t(`errors.${error}`) : null}
        recorder={{ ...recorder, start: startRecording }}
        onSend={(text) => sendText(text)}
        onTyping={() => setVoiceError(null)}
      />
    </div>
  );
}
