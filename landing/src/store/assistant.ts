import { create } from 'zustand';
import { type AssistantState, INITIAL_STATE, type Reply, respond, startQuote } from '@/lib/assistant/respond';
import type { PriceBook } from '@/lib/prices/price-book';

export type ChatMessage =
  | { id: number; role: 'user'; text: string; voice: boolean }
  | { id: number; role: 'assistant'; reply: Reply; fresh: boolean };

type AssistantStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
  messages: ChatMessage[];
  engine: AssistantState;
  thinking: boolean;
  send: (text: string, book: PriceBook, voice?: boolean) => void;
  askQuote: (label: string) => void;
  settle: (id: number) => void;
  reset: () => void;
};

const THINK_BASE_MS = 650;
const THINK_JITTER_MS = 450;
const THINK_CARD_MS = 350;

let nextId = 1;
const id = () => nextId++;
let pendingReply: ReturnType<typeof setTimeout> | undefined;

const thinkingTime = (reply: Reply) =>
  THINK_BASE_MS + Math.random() * THINK_JITTER_MS + (reply.kind === 'estimate' || reply.kind === 'calc' || reply.kind === 'check' ? THINK_CARD_MS : 0);

export const useAssistant = create<AssistantStore>()((set, get) => {
  const exchange = (text: string, voice: boolean, next: { state: AssistantState; reply: Reply }) => {
    set(({ messages }) => ({ engine: next.state, thinking: true, messages: [...messages, { id: id(), role: 'user', text, voice }] }));
    pendingReply = setTimeout(() => {
      set(({ messages }) => ({
        thinking: false,
        messages: [...messages, { id: id(), role: 'assistant', reply: next.reply, fresh: true }],
      }));
    }, thinkingTime(next.reply));
  };

  return {
    open: false,
    setOpen: (open) => set({ open }),
    messages: [],
    engine: INITIAL_STATE,
    thinking: false,
    send: (text, book, voice = false) => {
      const trimmed = text.trim();
      if (!trimmed || get().thinking) return;
      exchange(trimmed, voice, respond(get().engine, trimmed, book));
    },
    askQuote: (label) => {
      if (get().thinking) return;
      exchange(label, false, startQuote(get().engine));
    },
    settle: (messageId) =>
      set(({ messages }) => ({
        messages: messages.map((message) => (message.id === messageId && message.role === 'assistant' ? { ...message, fresh: false } : message)),
      })),
    reset: () => {
      clearTimeout(pendingReply);
      set({ messages: [], engine: INITIAL_STATE, thinking: false });
    },
  };
});
