import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { QueryProvider } from './providers/query';
import { bindSessionToHttp } from './providers/session';
import { router } from './router';
import './styles/index.css';

bindSessionToHttp();

const root = document.getElementById('root');
if (!root) throw new Error('Root element is missing');

createRoot(root).render(
  <StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" theme="system" richColors closeButton />
    </QueryProvider>
  </StrictMode>,
);
