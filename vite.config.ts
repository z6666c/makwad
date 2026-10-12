import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// GitHub Pages serves the site from https://<user>.github.io/makwad/
export default defineConfig({
  base: '/makwad/',
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\/convex\//, replacement: fileURLToPath(new URL('./convex/', import.meta.url)) },
      { find: /^@\//, replacement: fileURLToPath(new URL('./src/', import.meta.url)) },
    ],
  },
})
