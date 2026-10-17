import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  ssr: {
    // Vercel's Node File Trace omits this deep import when the packages are external.
    noExternal: ['@langchain/openai', 'openai'],
  },
});
