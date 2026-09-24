import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Define SITE_URL (p. ej. https://tudominio.com) para canonical, og:url, JSON-LD y robots.txt.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
