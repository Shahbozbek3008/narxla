import type { ReactNode } from 'react';

type CtaGroupProps = {
  children: ReactNode;
};

export function CtaGroup({ children }: CtaGroupProps) {
  return <div className="grid grid-cols-[auto_auto] gap-3 max-sm:w-full max-sm:grid-cols-1">{children}</div>;
}
