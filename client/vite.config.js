import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config — proxies /api requests to the Express backend on :5000
// so the frontend can use relative `/api/...` URLs in dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
