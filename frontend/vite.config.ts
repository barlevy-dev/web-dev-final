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
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
