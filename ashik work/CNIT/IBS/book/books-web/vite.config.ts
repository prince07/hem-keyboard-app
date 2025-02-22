import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'fyo': path.resolve(__dirname, './fyo'),
      'utils': path.resolve(__dirname, './utils'),
      'models': path.resolve(__dirname, './models'),
      'schemas': path.resolve(__dirname, './schemas'),
      'reports': path.resolve(__dirname, './reports'),
      'dummy': path.resolve(__dirname, './dummy'),
      'src': path.resolve(__dirname, './src'),
      'regional': path.resolve(__dirname, './regional')
    },
  },
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
  },
  server: {
    port: 3500,
    proxy: {
      '/api': {
        target: 'http://localhost:3501',
        changeOrigin: true,
      },
    },
  },
});
