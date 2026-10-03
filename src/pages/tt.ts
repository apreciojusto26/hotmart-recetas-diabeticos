import type { APIRoute } from 'astro';

// Link corto para TikTok: redirige a la captura con UTMs para que GA4 atribuya la visita.
// 302 (temporal) para poder cambiar los UTMs sin que los navegadores cacheen la redirección.
export const prerender = false;

export const GET: APIRoute = ({ redirect }) =>
  redirect('/?utm_source=tiktok&utm_medium=social&utm_campaign=bio', 302);
