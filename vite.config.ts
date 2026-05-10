import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      VitePWA({
        injectRegister: 'auto',
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', './src/assets/react.svg', 'favicon.svg'],
        manifest: {
          name: 'pwa-test',
          short_name: 'pwa-test',
          description: 'pwa-test',
          theme_color: '#ffffff',
          background_color: '#242424',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ],
        },
        mode: "development",
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallback: 'index.html',
        },
        workbox: {
          globPatterns: ['**/*'],
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 20000000
        },
    }),
    tanstackRouter({
      target: 'react'
    }),
    basicSsl({
      name: 'PWA Test'
    }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
  },
})
