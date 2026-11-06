
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://blog-backend-g6zx.onrender.com',
        changeOrigin: true,
      },
    },
  },

  preview: {
    allowedHosts: ['blog-frontend-z03a.onrender.com'],
  },
});
