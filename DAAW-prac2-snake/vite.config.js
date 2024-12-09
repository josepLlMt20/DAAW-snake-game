import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, 
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.1.40:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Elimina '/api' antes de reenviar
      },
    },
  },
})
