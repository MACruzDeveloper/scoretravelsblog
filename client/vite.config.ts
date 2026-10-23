import { defineConfig, UserConfig } from 'vite'
import type { InlineConfig } from 'vitest'
import react from '@vitejs/plugin-react'
import sass from 'sass'
import path from 'path'

interface VitestConfigExport extends UserConfig {
  test: InlineConfig
}

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [react()],
  resolve: {
    mainFields: [],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@images': path.resolve(__dirname, './src/assets/images'),
      '@admin': path.resolve(__dirname, './src/components/admin'),
      '@components': path.resolve(__dirname, './src/components'),
      '@common': path.resolve(__dirname, './src/components/common'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
      },
    },
  },
  build: {
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['react-moment', 'dompurify'],
          'vendor-icons': ['react-icons'],
          'vendor-map': ['leaflet', 'react-leaflet'],
          'vendor-zustand': ['zustand'],
        },
      },
    },
    // Enable source maps for production (disable in final build)
    sourcemap: false,
    // Reduce CSS size
    cssCodeSplit: true,
  },
  server: {
    open: true,
    host: true
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    css: true,
  }
} as VitestConfigExport)
