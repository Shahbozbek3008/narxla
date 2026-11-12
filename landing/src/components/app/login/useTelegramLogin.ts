'use client';

import { useCallback, useEffect, useState } from 'react';
import type { TelegramAuthData } from '@/lib/api/types';

type TelegramWidget = {
  Login: { auth: (options: { bot_id: string; request_access?: 'write' }, callback: (data: TelegramAuthData | false) => void) => void };
};

declare global {
  interface Window {
    Telegram?: TelegramWidget;
  }
}

const SCRIPT_SRC = 'https://telegram.org/js/telegram-widget.js?22';

export const TELEGRAM_BOT_ID = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID ?? '';

function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Telegram?.Login) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? Object.assign(document.createElement('script'), { src: SCRIPT_SRC, async: true });
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Telegram widget failed to load')), { once: true });
    if (!existing) document.head.append(script);
  });
}

export function useTelegramLogin(onAuth: (data: TelegramAuthData) => void, onFailure: () => void) {
  const [ready, setReady] = useState(false);
  const enabled = TELEGRAM_BOT_ID !== '';

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    loadScript().then(
      () => active && setReady(true),
      () => active && setReady(false),
    );
    return () => {
      active = false;
    };
  }, [enabled]);

  const start = useCallback(() => {
    const widget = window.Telegram;
    if (!widget) return onFailure();
    widget.Login.auth({ bot_id: TELEGRAM_BOT_ID, request_access: 'write' }, (data) => (data ? onAuth(data) : onFailure()));
  }, [onAuth, onFailure]);

  return { enabled, ready, start };
}
