import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: './', // relative URLs so the build works from GitHub Pages
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
    extensions: ['.mjs', '.js', '.json', '.vue']
  },
  build: { outDir: 'docs', emptyOutDir: true },
  server: { port: 8080 }
})
