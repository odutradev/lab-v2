import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.FRONTEND_PORT || process.env.FRONTEND_PORT) || 8080

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png'],
        manifest: {
          name: 'LAB Portal',
          short_name: 'LAB',
          description: 'LAB - Sistema de Gestão e Hábitos',
          theme_color: '#0c101c',
          background_color: '#0c101c',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png'
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
        }
      })
    ],
    server: {
      port
    },
    resolve: {
      alias: {
        '@package': fileURLToPath(new URL('../package.json', import.meta.url)),
        '@rootPackage': fileURLToPath(new URL('../package.json', import.meta.url)),
        '@actions': fileURLToPath(new URL('./src/actions', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
        '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
        '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
        '@projectTypes': fileURLToPath(new URL('./src/types', import.meta.url)),
        '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
        '@routes': fileURLToPath(new URL('./src/routes', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url))
      }
    }
  }
})
