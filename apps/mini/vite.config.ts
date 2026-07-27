import { defineConfig } from 'vite'
import uniImport from '@dcloudio/vite-plugin-uni'
const uni = (uniImport as any).default ?? uniImport
export default defineConfig({ plugins: [uni()], server: { port: 5174, host: '127.0.0.1', proxy: { '/api': 'http://127.0.0.1:3001' } } })
// H5 local demo port is declared through the Uni Vite server configuration.
