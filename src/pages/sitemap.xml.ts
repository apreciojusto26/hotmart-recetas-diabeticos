import type { APIRoute } from 'astro';

const PATHS = ['/', '/200-recetas-para-diabeticos'];

export const GET: APIRoute = ({ site }) => {
  const urls = site
    ? PATHS.map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`).join('\n')
    : '';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
