import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'build',
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['import', 'legacy-js-api'],
        },
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    // plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
      port: 5179,
      host: true,         // bind to 0.0.0.0 so subdomain.localhost resolves
      open: true,
      allowedHosts: 'all', // allow any hostname including *.localhost subdomains
      proxy: {
        // Proxy all /api requests to the local backend — avoids CORS in development
        '/api': {
          target: 'http://localhost:9001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
