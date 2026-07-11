import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3636',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3636',
        changeOrigin: true,
      },
    },
  },
})
