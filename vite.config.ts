import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  cacheDir: 'node_modules/.vite-foodmap',
  plugins: [react()],
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
