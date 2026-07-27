import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/lavida/' : '/',
  plugins: [vue()],
  server: { port: 5173, host: '127.0.0.1', proxy: { '/api': 'http://127.0.0.1:3001' } },
})
