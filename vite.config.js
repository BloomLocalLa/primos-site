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
            return `/collections/primos/activities?offset=${offset}&limit=${limit}`
          } else if (endpoint === 'amm-pools') {
            return '/mmm/pools?collectionSymbol=primos'
          } else if (endpoint === 'holder_stats') {
            return '/collections/primos/holder_stats'
          } else if (endpoint === 'token') {
            const mint = url.searchParams.get('mint')
            return `/tokens/${mint}`
          }
          return path
        },
      },
    },
  },
})
