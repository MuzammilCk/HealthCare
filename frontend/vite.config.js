import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('three') ||
              id.includes('@react-three') ||
              id.includes('postprocessing') ||
              id.includes('/drei/')
            )
              return 'three';
            if (id.includes('framer-motion') || id.includes('gsap')) return 'motion';
            if (id.includes('react-icons') || id.includes('lucide-react')) return 'icons';
            return 'vendor';
          }
        },
      },
    },
  },
})
