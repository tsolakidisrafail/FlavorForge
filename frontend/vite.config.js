import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Backend server URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Προαιρετικό: αν θέλουμε να αφαιρέσουμε το /api από το URL
      }
    }
  }
});
