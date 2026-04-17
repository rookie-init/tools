import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? '/tools/' : '/';

  return {
    base,
    plugins: [
      mkcert({ savePath: '.vite-plugin-mkcert' }),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'generateSW',
        includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
        manifest: {
          name: 'QR Tool',
          short_name: 'QR Tool',
          start_url: base,
          scope: base,
          display: 'standalone',
          background_color: '#000000',
          theme_color: '#000000',
          icons: [
            {
              src: 'icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
          share_target: {
            action: base,
            method: 'GET',
            enctype: 'application/x-www-form-urlencoded',
            params: {
              text: 'text',
              url: 'url',
            },
          },
        },
        workbox: {
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
        },
      }),
    ],
    server: {
      host: true,
      port: 4173,
      https: mode === 'https',
    },
    preview: {
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
  };
});
