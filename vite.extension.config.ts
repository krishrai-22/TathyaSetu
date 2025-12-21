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
        
        // Update paths to match the flattened build output
        manifest.action.default_popup = 'popup.html';
        manifest.background.service_worker = 'background.js';
        
        fs.writeFileSync(
          resolve(distDir, 'manifest.json'), 
          JSON.stringify(manifest, null, 2)
        );
      }

      // 2. Copy Icons (if you have them in public/icons or extension/icons)
      // For this example, we assume icons might exist in public/icons, Vite copies public folder by default.
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [
      react(),
      copyExtensionAssets()
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
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
          assetFileNames: '[name].[ext]'
        }
      }
    }
  };
});