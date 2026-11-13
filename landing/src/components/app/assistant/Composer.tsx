'use client';

import { ArrowUp, Check, Loader2, Mic, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { RecorderStatus } from './useVoiceRecorder';

const MAX_TEXTAREA_HEIGHT = 140;
const WAVE_BARS = 28;

type ComposerProps = {
  busy: boolean;
  recorder: {
    status: RecorderStatus;
    level: number;
    seconds: number;
    maxSeconds: number;
    start: () => void;
    stop: () => void;
    cancel: () => void;
  };
  error: string | null;
  onSend: (text: string) => void;
  onTyping: () => void;
};

const ICON_BUTTON =
  'grid size-11 shrink-0 place-items-center rounded-full transition-[background-color,color,scale,opacity] duration-150 active:scale-90 disabled:opacity-40';

function Waveform({ level }: { level: number }) {
  const [history, setHistory] = useState<number[]>(() => Array.from({ length: WAVE_BARS }, () => 0));

  useEffect(() => {
    setHistory((current) => [...current.slice(1), level]);
  }, [level]);

  return (
    <span className="flex h-6 flex-1 items-center gap-[3px] overflow-hidden" aria-hidden>
      {history.map((value, index) => (
        <span
          key={index}
          className="w-[3px] shrink-0 rounded-full bg-accent transition-[height] duration-100"
          style={{ height: `${Math.max(12, value * 100)}%`, opacity: 0.35 + (index / WAVE_BARS) * 0.65 }}
        />
      ))}
    </span>
  );
}

export function Composer({ busy, recorder, error, onSend, onTyping }: ComposerProps) {
  const t = useTranslations('app.assistant');
  const [text, setText] = useState('');
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: hover)').matches) textarea.current?.focus();
  }, []);
  const recording = recorder.status === 'recording';
  const starting = recorder.status === 'starting';

  useEffect(() => {
    const element = textarea.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [text]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!text.trim() || busy) return;
    onSend(text);
    setText('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) submit(event);
  };

  return (
    <div className="border-t border-line bg-surface px-3 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] md:pb-3">
      {error && (
        <p role="alert" className="mb-2 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-[13px]/5 text-danger">
          {error}
        </p>
      )}
      <form
        onSubmit={submit}
        className={cn(
          'flex items-end gap-1.5 rounded-[24px] border bg-bg-2 p-1.5 transition-[border-color,box-shadow] duration-200',
          recording ? 'border-accent shadow-[0_0_0_4px_var(--accent-soft)]' : 'border-line-2 focus-within:border-fg-3',
        )}
      >
        {recording ? (
          <>
            <button type="button" className={cn(ICON_BUTTON, 'text-fg-2 hover:bg-surface-2')} aria-label={t('cancel')} onClick={recorder.cancel}>
              <X size={20} strokeWidth={1.75} />
            </button>
            <div className="flex min-h-11 flex-1 items-center gap-3 px-1" aria-live="polite">
              <span className="relative flex size-2.5 shrink-0">
                <span className="absolute inset-0 animate-ping rounded-full bg-danger opacity-60" />
                <span className="relative size-2.5 rounded-full bg-danger" />
              </span>
              <Waveform level={recorder.level} />
              <span className="shrink-0 text-xs text-fg-2 tabular-nums">
                {t('recording', { seconds: recorder.seconds, max: recorder.maxSeconds })}
              </span>
            </div>
            <button type="button" className={cn(ICON_BUTTON, 'gloss bg-accent text-accent-ink')} aria-label={t('stop')} onClick={recorder.stop}>
              <Check size={20} strokeWidth={2.25} />
            </button>
          </>
        ) : busy ? (
          <div className="flex min-h-11 flex-1 items-center gap-2.5 px-3.5 text-sm text-fg-2" aria-live="polite">
            <Loader2 size={16} strokeWidth={2} className="animate-spin text-accent-text" aria-hidden />
            {t('transcribing')}
          </div>
        ) : (
          <>
            <textarea
              ref={textarea}
              rows={1}
              value={text}
              enterKeyHint="send"
              placeholder={t('placeholder')}
              aria-label={t('placeholder')}
              onKeyDown={onKeyDown}
              onChange={(event) => {
                setText(event.target.value);
                onTyping();
              }}
              className="max-h-[140px] min-h-11 flex-1 resize-none bg-transparent px-3.5 py-[11px] text-base/[22px] text-fg outline-none placeholder:text-fg-3 sm:text-[15px]/[22px]"
            />
            {text.trim() ? (
              <button type="submit" className={cn(ICON_BUTTON, 'gloss bg-accent text-accent-ink hover:bg-accent-hover')} aria-label={t('send')}>
                <ArrowUp size={20} strokeWidth={2.25} />
              </button>
            ) : (
              <button
                type="button"
                disabled={starting}
                className={cn(ICON_BUTTON, 'bg-surface-2 text-fg hover:bg-surface-3')}
                aria-label={t('record')}
                onClick={recorder.start}
              >
                {starting ? <Loader2 size={18} strokeWidth={2} className="animate-spin" /> : <Mic size={20} strokeWidth={1.75} />}
              </button>
            )}
          </>
        )}
      </form>
    </div>
  );
}
