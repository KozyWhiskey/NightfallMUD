import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API requests to our backend server
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // The address of our Node.js server
        changeOrigin: true, // Recommended for proxies
      }
    }
  }
})