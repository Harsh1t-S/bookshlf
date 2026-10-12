import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The API lives in ../backend (npm run dev there, port 4000); the dev server forwards /api to it.
  server: {
    proxy: { '/api': 'http://localhost:4000' },
  },
})
