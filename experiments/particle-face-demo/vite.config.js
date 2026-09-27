import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: 'experiments/particle-face-demo',
  plugins: [vue()],
  resolve: { alias: { '@demo': '/experiments/particle-face-demo/src' } },
  server: { host: '127.0.0.1' },
  build: { outDir: '../../dist-particle-face-demo', emptyOutDir: true },
})
