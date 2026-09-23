import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) return 'three';
            if (id.includes('recharts') || id.includes('d3-')) return 'charts';
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router') || id.includes('framer-motion')) return 'vendor';
          }
        },
      },
    },
  },
})
