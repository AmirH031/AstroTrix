import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  base: '/AstroTrix/',
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
    }),
    
    // Compression for better loading
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    
    // Bundle analyzer (only in analyze mode)
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    
    VitePWA({
      registerType: 'autoUpdate', 
      devOptions: {
        enabled: true 
      },
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'AstroTrix - Alien-Powered Productivity',
        short_name: 'AstroTrix',
        description: 'Your ultimate productivity companion with alien-powered features',
        theme_color: '#00ff00',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/AstroTrix/',
        id: '/AstroTrix/',
        start_url: '/AstroTrix/',
        icons: [
    {
      src: '/AstroTrix/icon-192.png',
      type: 'image/png',
      sizes: '192x192',
      purpose: 'maskable'
    },
    {
      src: '/AstroTrix/icon-512.png',
      type: 'image/png',
      sizes: '512x512',
      purpose: 'maskable'
    },
    {
    src: '/AstroTrix/icon-144.png',
    type: 'image/png',
    sizes: '144x144',
    purpose: 'any'
  },
    {
      src: '/AstroTrix/icon-144.png',
      type: 'image/png',
      sizes: '144x144',
      purpose: 'any'
    }
  ],
  screenshots: [
    {
      src: '/AstroTrix/screenshots/desktop-wide.png',
      sizes: '1280x720',
      type: 'image/png',
      form_factor: 'wide'
    },
    {
      src: '/AstroTrix/screenshots/mobile-narrow.png',
      sizes: '360x640',
      type: 'image/png',
      form_factor: 'narrow'
    }
  ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            }
          }
        ]
      }
    })
  ],
  
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    // Optimize build output
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-select'],
          'motion-vendor': ['framer-motion'],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
    ],
  },
  
  server: {
    // Improve dev server performance
    fs: {
      strict: false,
    },
  },
});