import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.FRONTEND_PORT || process.env.FRONTEND_PORT) || 8080

  return {
    plugins: [react()],
    server: {
      port
    },
    resolve: {
      alias: {
        '@actions': fileURLToPath(new URL('./src/actions', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
        '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
        '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
        '@projectTypes': fileURLToPath(new URL('./src/types', import.meta.url)),
        '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
        '@routes': fileURLToPath(new URL('./src/routes', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/styles', import.meta.url))
      }
    }
  }
})
