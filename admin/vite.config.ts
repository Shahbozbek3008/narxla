import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      include: ['react', 'react-dom/client', 'react-router', '@tanstack/react-query', 'zustand', 'sonner', 'lucide-react', 'clsx', 'tailwind-merge'],
    },
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: {
      port: 5174,
      proxy: { '/api': { target: env.API_PROXY_TARGET ?? 'http://localhost:4000', changeOrigin: true } },
    },
  };
});
