import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({mode}) => {
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    build: {
      target: 'es2015',
      rollupOptions: {
        output: {
          // Split rarely-changing vendor libraries into their own chunks so
          // they stay cached across app deploys.
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'motion-vendor': ['framer-motion'],
            'supabase-vendor': ['@supabase/supabase-js'],
          },
        },
      },
    },
    // Only expose NODE_ENV. VITE_-prefixed vars reach the client via
    // import.meta.env; the previous `'process.env': env` leaked the ENTIRE
    // .env (including secrets) into the bundle.
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
