import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// Define SITE_URL (p. ej. https://tudominio.com) para canonical, og:url, JSON-LD y robots.txt.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  // Las páginas siguen siendo estáticas; solo las rutas con `prerender = false` (/api/lead) corren en servidor.
  adapter: vercel(),
  integrations: [react()],
  env: {
    schema: {
      // Secretos solo de servidor: nunca llegan al navegador y se leen en runtime.
      SYSTEME_IO_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      SYSTEME_IO_LEAD_TAG_ID: envField.number({ context: 'server', access: 'secret' }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
