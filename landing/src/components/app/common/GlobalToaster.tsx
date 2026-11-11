'use client';

import { Toaster } from '@/components/ui/sonner';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { usePathname } from '@/i18n/navigation';

const DESKTOP_OFFSET = { right: 24, bottom: 24 };
const COMPACT_OFFSET = { left: 16, right: 16, bottom: 16 };
const TAB_BAR_OFFSET = { left: 16, right: 16, bottom: 96 };

export function GlobalToaster() {
  const { isCompact } = useBreakpoints();
  const insideApp = /^\/app(\/|$)/.test(usePathname());
  const compactOffset = insideApp ? TAB_BAR_OFFSET : COMPACT_OFFSET;

  return (
    <Toaster
      position={isCompact ? 'bottom-center' : 'bottom-right'}
      offset={isCompact ? compactOffset : DESKTOP_OFFSET}
      mobileOffset={compactOffset}
    />
  );
}
