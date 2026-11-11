import type { ReactNode } from 'react';

export default function AppTemplate({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 animate-screen-in flex-col">{children}</div>;
}
