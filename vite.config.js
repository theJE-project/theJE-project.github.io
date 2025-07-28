import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path' // Node.js path 모듈

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@router': path.resolve(__dirname,'src/router'),
      '@pages': path.resolve(__dirname,'src/pages'),
      '@hooks': path.resolve(__dirname,'src/hooks'),
      '@axios': path.resolve(__dirname,'src/axios'),
    },
  },
})