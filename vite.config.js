import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: process.env.VITE_DEV_HOST || 'localhost',
    port: 5173,
    strictPort: true
  }
})
