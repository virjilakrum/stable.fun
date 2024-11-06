import { defineConfig } from 'vite';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  resolve: {
    alias: {
      'crypto': 'crypto-browserify',
      'stream': 'stream-browserify',
      'path': 'path-browserify',
      'os': 'os-browserify',
      // 'fs': 'browserify-fs', 
    }
  }
});
