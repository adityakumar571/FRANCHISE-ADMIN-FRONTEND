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
      // Chunk splitting for faster initial load
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@coreui/react', '@coreui/coreui', 'antd'],
            mui: ['@mui/material', '@mui/icons-material'],
            charts: ['chart.js', 'recharts'],
          },
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}),
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
      // force: true  <-- REMOVED: yeh har reload pe deps dobara bundle karta tha (slow reload ka main reason)
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
      // Frequently used heavy packages pre-bundle karo
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'antd',
        '@coreui/react',
        'recharts',
        'dayjs',
        'moment',
      ],
    },
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
      host: true,
      open: true,
      allowedHosts: 'all',
      // HMR (Hot Module Replacement) fast reload ke liye
      hmr: {
        overlay: true,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:9001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
