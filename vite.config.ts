import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the project under /<repo-name>/.
// Override with VITE_BASE for previews / local builds.
const base = process.env.VITE_BASE ?? '/dm-simulator/';

export default defineConfig({
  plugins: [react()],
  base,
});
