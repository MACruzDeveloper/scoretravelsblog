import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vendor chunks: each group of packages goes to its own file for better caching.
// Higher priority wins, so React always lands in vendor-react even when a map
// or icon package depends on it.
const vendorGroup = (name: string, packages: string[], priority: number) => ({
  name,
  priority,
  test: new RegExp(`[\\\\/]node_modules[\\\\/](${packages.join('|')})[\\\\/]`),
})

export default defineConfig({
  plugins: [react()],
  resolve: {
    mainFields: [],
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@images': path.resolve(import.meta.dirname, './src/assets/images'),
      '@admin': path.resolve(import.meta.dirname, './src/components/admin'),
      '@components': path.resolve(import.meta.dirname, './src/components'),
      '@common': path.resolve(import.meta.dirname, './src/components/common'),
      '@store': path.resolve(import.meta.dirname, './src/store'),
      '@utils': path.resolve(import.meta.dirname, './src/utils'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // TODO: migrate @import and global functions to @use (Sass 3 removes them)
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
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
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            vendorGroup('vendor-react', ['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'], 50),
            vendorGroup('vendor-map', ['leaflet', 'react-leaflet', '@react-leaflet'], 40),
            vendorGroup('vendor-icons', ['react-icons'], 30),
            vendorGroup('vendor-ui', ['dompurify'], 20),
            vendorGroup('vendor-zustand', ['zustand'], 10),
          ],
        },
      },
    },
    // Enable source maps for production (disable in final build)
    sourcemap: false,
    // Reduce CSS size
    cssCodeSplit: true,
    // Same browsers Vite 4 supported: keeps classic CSS syntax (min-width media
    // queries, rgba colors) instead of newer forms older Safari versions ignore
    cssTarget: ['chrome87', 'edge88', 'firefox78', 'safari14'],
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
})
