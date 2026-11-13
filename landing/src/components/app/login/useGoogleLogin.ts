'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

type GoogleCredential = { credential?: string };

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (options: { client_id: string; callback: (response: GoogleCredential) => void; ux_mode?: 'popup' }) => void;
      renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const MAX_BUTTON_WIDTH = 400;

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? Object.assign(document.createElement('script'), { src: SCRIPT_SRC, async: true });
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Google script failed to load')), { once: true });
    if (!existing) document.head.append(script);
  });
}

export function useGoogleLogin(onCredential: (credential: string) => void, onFailure: () => void) {
  const slot = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onCredential, onFailure });
  const [ready, setReady] = useState(false);
  const enabled = GOOGLE_CLIENT_ID !== '';

  useEffect(() => {
    handlers.current = { onCredential, onFailure };
  });

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    loadScript().then(
      () => {
        const host = slot.current;
        const identity = window.google?.accounts.id;
        if (!active || !host || !identity) return;
        identity.initialize({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: 'popup',
          callback: ({ credential }) => (credential ? handlers.current.onCredential(credential) : handlers.current.onFailure()),
        });
        identity.renderButton(host, {
          type: 'standard',
          size: 'large',
          width: Math.min(MAX_BUTTON_WIDTH, Math.round(host.getBoundingClientRect().width)),
        });
        setReady(true);
      },
      () => active && setReady(false),
    );
    return () => {
      active = false;
    };
  }, [enabled]);

  return { enabled, ready, slot: slot as RefObject<HTMLDivElement> };
}
