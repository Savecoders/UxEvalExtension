import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.'
        }
      ]
    })
  ],

  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: '[name].js',
        dir: 'dist'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
