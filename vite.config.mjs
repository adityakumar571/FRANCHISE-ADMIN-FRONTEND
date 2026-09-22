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
      // Raise chunk warning limit (big POS/Dashboard files are expected)
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Split heavy vendor libraries into separate cached chunks
          manualChunks(id) {
            // Core React — always cached
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
              return 'react-core'
            }
            // CoreUI — large, change rarely
            if (id.includes('@coreui')) {
              return 'coreui'
            }
            // MUI — large, change rarely
            if (id.includes('@mui')) {
              return 'mui'
            }
            // Antd — large, change rarely
            if (id.includes('antd') || id.includes('rc-') || id.includes('@ant-design')) {
              return 'antd'
            }
            // Charts
            if (id.includes('recharts') || id.includes('chart.js') || id.includes('d3-')) {
              return 'charts'
            }
            // PDF / Excel utilities — load only when needed
            if (id.includes('jspdf') || id.includes('xlsx') || id.includes('pdfjs') || id.includes('html2pdf') || id.includes('file-saver')) {
              return 'pdf-excel'
            }
            // Lucide icons
            if (id.includes('lucide-react') || id.includes('@heroicons') || id.includes('@fortawesome')) {
              return 'icons'
            }
            // Other large UI libs
            if (id.includes('primereact') || id.includes('sweetalert') || id.includes('react-toastify') || id.includes('react-hot-toast')) {
              return 'ui-misc'
            }
          },
        },
      },
    },

    css: {
      postcss: {
        plugins: [autoprefixer({})],
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
      // NO force:true — let Vite cache deps between reloads
      esbuildOptions: {
        loader: { '.js': 'jsx' },
      },
      // Pre-bundle only what's needed on every page
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'js-cookie',
        'dayjs',
        'react-hot-toast',
      ],
      // Exclude rarely-used heavy libs from pre-bundling (lazy loaded anyway)
      exclude: [
        'pdfjs-dist',
        'html2pdf.js',
        'xlsx',
        'jspdf',
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
      hmr: { overlay: true },
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
