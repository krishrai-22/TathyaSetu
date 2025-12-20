import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Fix: Cast process to any to avoid TypeScript error about missing cwd() in Process type
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Vital: This replaces process.env.API_KEY in your code with the actual value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});