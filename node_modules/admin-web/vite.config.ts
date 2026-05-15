import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Fix "global is not defined" error in some browser-based libraries
    global: 'window',
  },
  optimizeDeps: {
    include: ['sockjs-client'],
  },
})
