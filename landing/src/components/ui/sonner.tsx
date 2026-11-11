'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster(props: ToasterProps) {
  return <Sonner visibleToasts={1} duration={3200} gap={8} toastOptions={{ unstyled: true }} {...props} />;
}

export { Toaster };
