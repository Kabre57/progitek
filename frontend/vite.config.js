import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ⚠️ Important : base = chemin sous lequel ton app est servie (ici via nginx)
export default defineConfig({
  base: '/progitek/',
  plugins: [react()],
});
