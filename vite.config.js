import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: process.env.VITE_HOST || 'localhost',
    https: isDev
      ? {
          key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
          cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem')),
        }
      : false,
  },
});
