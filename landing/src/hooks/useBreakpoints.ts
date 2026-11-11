import { useMediaQuery } from './useMediaQuery';

export function useBreakpoints() {
  const isPhone = useMediaQuery('(max-width: 639px)');
  const isCompact = useMediaQuery('(max-width: 899px)');
  const isXl = useMediaQuery('(min-width: 1180px)');
  return { isPhone, isCompact, isDesktop: !isCompact, isXl };
}
