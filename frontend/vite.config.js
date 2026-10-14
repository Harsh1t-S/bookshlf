import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The dev server forwards /api to the live API. To try backend changes, run ../backend
  // (npm run dev, port 4000) and start this with API_PROXY=http://localhost:4000.
  server: {
    proxy: { '/api': process.env.API_PROXY || 'https://api.bookfolio.live' },
  },
})
