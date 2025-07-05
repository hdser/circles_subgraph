import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'apollo-graphql': ['@apollo/client', 'graphql'],
          'echarts': ['echarts', 'echarts-for-react'],
          'ui-vendor': ['lucide-react', 'clsx', 'react-hot-toast'],
          'markdown': ['react-markdown', 'remark-gfm'],
          'socket': ['socket.io-client'],
          'date': ['date-fns']
        }
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@apollo/client',
      'graphql',
      'echarts',
      'echarts-for-react',
      'socket.io-client'
    ]
  }
})