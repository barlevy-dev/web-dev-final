/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const httpsConfig = (() => {
  try {
    return {
      key: fs.readFileSync(path.resolve(__dirname, '../certs/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '../certs/server.crt')),
    };
  } catch {
    return undefined;
  }
})();

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    https: httpsConfig,
    proxy: {
      '/uploads': {
        target: 'https://localhost:5001',
        secure: false, // trust self-signed cert on backend
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: false,
  },
});
