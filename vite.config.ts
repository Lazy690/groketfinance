import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Ensure this matches your Vercel output directory
    chunkSizeWarningLimit: 500, // Adjust if needed
  },
  base: './', // Add this line to ensure relative paths
});
