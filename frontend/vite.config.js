import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.139.2',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://192.168.139.2',
        changeOrigin: true,
      }
    }
  }
})