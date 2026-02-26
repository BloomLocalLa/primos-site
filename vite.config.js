import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/magiceden': {
        target: 'https://api-mainnet.magiceden.dev/v2',
        changeOrigin: true,
        rewrite: (path) => {
          // Parse the query parameters from the path
          const url = new URL(path, 'http://localhost')
          const endpoint = url.searchParams.get('endpoint')
          const offset = url.searchParams.get('offset') || 0
          const limit = url.searchParams.get('limit') || 50

          if (endpoint === 'stats') {
            return '/collections/primos/stats'
          } else if (endpoint === 'listings') {
            return `/collections/primos/listings?offset=${offset}&limit=${limit}`
          } else if (endpoint === 'activities') {
            return `/collections/primos/activities?offset=0&limit=${limit}`
          }
          return path
        },
      },
    },
  },
})
