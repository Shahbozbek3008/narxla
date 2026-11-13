'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bot, Mic } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { Chip } from '@/lib/assistant/respond';
import { EASE_OUT } from '@/lib/motion';
import { type ChatMessage, useAssistant } from '@/store/assistant';
import { CalcReplyCard, CheckReplyCard, EstimateReplyCard, useReplyIntro } from './ReplyCards';

const TYPE_DURATION_MS = 700;
const TYPE_TICK_MS = 24;

type MessageListProps = {
  messages: ChatMessage[];
  onChip: (chip: Chip) => void;
};

export function AssistantAvatar({ size = 32 }: { size?: number }) {
  return (
    <span
      className="gloss grid shrink-0 place-items-center rounded-full bg-accent text-accent-ink shadow-[0_0_0_3px_var(--accent-soft)]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Bot size={size * 0.55} strokeWidth={1.9} />
    </span>
  );
}

function useChipLabel() {
  const tA = useTranslations('app.assistant');
  const tApp = useTranslations('app');
  const examples = tA.raw('examples') as string[];
  const works = tA.raw('works') as string[];

  return (chip: Chip) => {
    switch (chip.kind) {
      case 'room':
        return tApp(`rooms.${chip.id}.name`);
      case 'quality':
        return tApp(`qualities.${chip.id}.name`);
      case 'text':
        return chip.text;
      case 'example':
        return examples[chip.index] ?? '';
      case 'work':
        return works[chip.index] ?? '';
      case 'askQuote':
        return tA('askQuoteChip');
    }
  };
}

export function ChipRow({ chips, onChip }: { chips: Chip[]; onChip: (chip: Chip) => void }) {
  const label = useChipLabel();
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onChip(chip)}
          className="rounded-full border border-line-2 bg-surface px-3 py-1.5 text-[13px]/5 font-medium text-fg-2 transition-[border-color,color,background-color,scale] duration-150 hover:border-accent hover:bg-accent-soft hover:text-accent-text active:scale-95"
        >
          {label(chip)}
        </button>
      ))}
    </div>
  );
}

export { useChipLabel };

function AssistantMessage({ message, onChip }: { message: Extract<ChatMessage, { role: 'assistant' }>; onChip: (chip: Chip) => void }) {
  const intro = useReplyIntro();
  const settle = useAssistant((state) => state.settle);
  const reducedMotion = useReducedMotion();
  const { reply } = message;
  const text = intro(reply);
  const animate = message.fresh && !reducedMotion;
  const [shown, setShown] = useState(animate ? 0 : text.length);
  const done = shown >= text.length;

  useEffect(() => {
    if (!animate) return;
    const step = Math.max(1, Math.ceil(text.length / (TYPE_DURATION_MS / TYPE_TICK_MS)));
    const timer = setInterval(() => {
      setShown((current) => {
        const next = Math.min(text.length, current + step);
        if (next >= text.length) clearInterval(timer);
        return next;
      });
    }, TYPE_TICK_MS);
    return () => clearInterval(timer);
  }, [animate, text]);

  useEffect(() => {
    if (done && message.fresh) settle(message.id);
  }, [done, message.fresh, message.id, settle]);

  return (
    <div className="flex w-full gap-2.5 sm:max-w-[560px]">
      <AssistantAvatar size={28} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <p className="rounded-2xl rounded-tl-md bg-surface-2 px-3.5 py-2.5 text-[15px]/[22px] text-fg" aria-label={text}>
          <span aria-hidden>{text.slice(0, shown)}</span>
          {!done && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-accent" aria-hidden />}
        </p>
        {done && (
          <motion.div
            className="flex flex-col gap-2.5"
            initial={animate || message.fresh ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            {reply.kind === 'estimate' && <EstimateReplyCard reply={reply} />}
            {reply.kind === 'calc' && <CalcReplyCard reply={reply} />}
            {reply.kind === 'check' && <CheckReplyCard reply={reply} />}
            <ChipRow chips={reply.chips} onChip={onChip} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  const t = useTranslations('app.assistant');
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="flex items-end gap-2.5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      role="status"
      aria-label={t('typing')}
    >
      <AssistantAvatar size={28} />
      <span className="flex h-[42px] items-center gap-1.5 rounded-2xl rounded-tl-md bg-surface-2 px-4">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="size-2 rounded-full bg-fg-3"
            animate={reducedMotion ? undefined : { y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </span>
    </motion.div>
  );
}

export function MessageList({ messages, onChip }: MessageListProps) {
  const t = useTranslations('app.assistant');
  const reducedMotion = useReducedMotion();
  const thinking = useAssistant((state) => state.thinking);

  return (
    <ol className="flex flex-col gap-4 pb-2" aria-live="polite">
      {messages.map((message) => (
        <motion.li
          key={message.id}
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT, delay: message.role === 'assistant' ? 0.12 : 0 }}
          className={message.role === 'user' ? 'flex justify-end' : 'flex'}
        >
          {message.role === 'user' ? (
            <p className="gloss max-w-[85%] rounded-2xl rounded-tr-md bg-accent px-3.5 py-2.5 text-[15px]/[22px] break-words whitespace-pre-wrap text-accent-ink sm:max-w-[480px]">
              {message.voice && (
                <span className="mr-1.5 inline-flex translate-y-0.5" title={t('voice')}>
                  <Mic size={14} strokeWidth={2} aria-label={t('voice')} />
                </span>
              )}
              {message.text}
            </p>
          ) : (
            <AssistantMessage message={message} onChip={onChip} />
          )}
        </motion.li>
      ))}
      <AnimatePresence>
        {thinking && (
          <li key="typing">
            <TypingIndicator />
          </li>
        )}
      </AnimatePresence>
    </ol>
  );
}
