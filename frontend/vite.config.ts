import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { BACKEND_LOCAL_PORT } from '@scaffold/shared/config'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the app from a subpath; the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  plugins: [preact(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${BACKEND_LOCAL_PORT}`,
        changeOrigin: true,
        ws: true,
      },
      '/ws': {
        target: `http://localhost:${BACKEND_LOCAL_PORT}`,
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
