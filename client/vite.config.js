import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5500
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'react-vendor'
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor'
            }
            if (id.includes('react-router')) {
              return 'routing-vendor'
            }
            if (id.includes('radix-ui')) {
              return 'ui-components'
            }
            return 'vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
