import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/tools/' : '/',
  plugins: [mkcert({ savePath: '.vite-plugin-mkcert' })],
  server: {
    host: true,
    port: 4173,
    https: mode === 'https',
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: ({ name }) => {
          if (name?.endsWith('.css')) return 'assets/app.css';
          return 'assets/[name][extname]';
        },
      },
    },
  },
}));
