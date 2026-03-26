import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    esbuildOptions: {
      drop: ['console', 'debugger'],
    },
    // 禁用代码分割，所有页面代码打入一个文件
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    chunkSizeWarningLimit: 800,
    target: 'es2018',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
})
