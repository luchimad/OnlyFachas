import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY),
  },
  build: {
    // Strip console.* calls in production builds
    minify: 'esbuild',
    ...(mode === 'production' && {
      esbuild: {
        drop: ['console', 'debugger'],
      },
    }),
    rollupOptions: {
      output: {
        // Keep chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
}));
