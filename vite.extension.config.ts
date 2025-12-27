import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to copy manifest and icons after build
const copyExtensionAssets = () => {
  return {
    name: 'copy-extension-assets',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist-extension');
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
      }

      // 1. Transform and Copy Manifest
      const manifestPath = resolve(__dirname, 'extension/manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        
        // DYNAMIC FIX: Check if Vite output popup.html in 'extension/' folder or root
        if (fs.existsSync(resolve(distDir, 'extension', 'popup.html'))) {
          manifest.action.default_popup = 'extension/popup.html';
        } else {
          manifest.action.default_popup = 'popup.html';
        }

        // Background script is usually flattened by Rollup to root
        manifest.background.service_worker = 'background.js';
        
        fs.writeFileSync(
          resolve(distDir, 'manifest.json'), 
          JSON.stringify(manifest, null, 2)
        );
      }

      // 2. Copy Icons to dist (checks public/icons)
      const srcIconsDir = resolve(__dirname, 'public/icons');
      const destIconsDir = resolve(distDir, 'icons');
      
      if (fs.existsSync(srcIconsDir)) {
         if (!fs.existsSync(destIconsDir)) {
            fs.mkdirSync(destIconsDir, { recursive: true });
         }
         fs.readdirSync(srcIconsDir).forEach(file => {
            fs.copyFileSync(resolve(srcIconsDir, file), resolve(destIconsDir, file));
         });
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Warn if API key is missing at build time
  if (!env.API_KEY) {
    console.warn("\x1b[33m%s\x1b[0m", "⚠️  WARNING: API_KEY is missing in your .env file!");
    console.warn("The extension will build, but will fail at runtime.");
  }

  return {
    plugins: [
      react(),
      copyExtensionAssets()
    ],
    // IMPORTANT: Base must be relative for extensions to load assets correctly
    base: './', 
    define: {
      // Use fallback empty string to prevent build crashes, handled in services/gemini.ts
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    },
    build: {
      chunkSizeWarningLimit: 2000,
      outDir: 'dist-extension',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'extension/popup.html'),
          background: resolve(__dirname, 'extension/background.js')
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
          manualChunks: {
             vendor: ['react', 'react-dom', '@google/genai', 'lucide-react'],
          }
        }
      }
    }
  };
});