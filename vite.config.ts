import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5000,
    strictPort: false,
    open: true,
    host: '0.0.0.0',
    headers: {
      'X-Frame-Options': 'ALLOWALL',
    },
    allowedHosts: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
