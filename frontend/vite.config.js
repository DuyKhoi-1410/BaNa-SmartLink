import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ViteImageOptimizer({
      jpg: { quality: 85 },
      jpeg: { quality: 85 },
      png: { quality: 85 },
      webp: { quality: 85 },
      exclude: /\.svg$/,
    }),
  ],
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
