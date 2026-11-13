'use client';

import { useProgress } from '@bprogress/next';
import { ProgressProvider } from '@bprogress/next/app';
import { type ReactNode, useEffect } from 'react';

const SHOW_AFTER_MS = 150;

const isModified = (event: MouseEvent) => event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

function isInternalNavigation(anchor: HTMLAnchorElement) {
  if (anchor.target === '_blank' || anchor.hasAttribute('download') || anchor.dataset.disableProgress === 'true') return false;
  const target = new URL(anchor.href, location.href);
  if (target.origin !== location.origin) return false;
  return target.pathname !== location.pathname || target.search !== location.search;
}

function LinkClickProgress() {
  const { start } = useProgress();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (isModified(event) || !(event.target instanceof Element)) return;
      const anchor = event.target.closest('a[href]');
      if (anchor instanceof HTMLAnchorElement && isInternalNavigation(anchor)) start(0, SHOW_AFTER_MS);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [start]);

  return null;
}

export function NavigationProgress({ children }: { children: ReactNode }) {
  return (
    <ProgressProvider
      color="var(--accent)"
      height="2px"
      delay={SHOW_AFTER_MS}
      shallowRouting
      disableAnchorClick
      options={{ showSpinner: false, minimum: 0.12, speed: 280, trickleSpeed: 220 }}
    >
      <LinkClickProgress />
      {children}
    </ProgressProvider>
  );
}
