import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' + HashRouter means the build works on any static host
// (GitHub Pages sub-path, Netlify, Vercel, Cloudflare Pages) without config.
export default defineConfig({
  base: './',
  plugins: [react()],
})
