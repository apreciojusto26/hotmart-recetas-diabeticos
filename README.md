# Vividia · Recetas para diabéticos

Embudo de dos páginas para captar emails con un PDF gratis y llevar a la compra del pack en Hotmart.

1. **`/`** Página de captura: 7 desayunos en PDF gratis. Un popup pide solo el email.
2. **`/200-recetas-para-diabeticos`** Página de ventas: 200+ recetas y 5 bonos, con botón al checkout de Hotmart.

Flujo completo:

```
Captura (popup, solo email)
  → POST /api/lead
  → Systeme.io: crea/busca el contacto y le asigna la etiqueta "Lead - 7 desayunos"
  → Workflow de Systeme.io: envía el PDF y los emails
  → Redirección a /200-recetas-para-diabeticos
  → Checkout de Hotmart
```

## Stack

Astro · React · Tailwind CSS v4 · pnpm · adaptador de Vercel (solo para `/api/lead`; el resto del sitio es estático)

## Comandos

```bash
pnpm install   # instalar dependencias
pnpm dev       # servidor local en http://localhost:4321
pnpm build     # genera el sitio estático en dist/
pnpm preview   # previsualiza el build
```

## Estructura

```
src/
  components/CapturePage.tsx        Captura + popup del formulario
  pages/
    api/lead.ts                     Endpoint (servidor): conecta con Systeme.io
    index.astro                     Ruta /
    200-recetas-para-diabeticos.astro   Ruta de ventas (SEO incluido)
    404.astro                       Página de error
    robots.txt.ts · sitemap.xml.ts  robots y sitemap
  styles/global.css                 Colores, fuentes y animaciones (Tailwind @theme)
public/
  assets/                           Logo, portada y PDF gratuito
  ventas/                           Imágenes de la página de ventas (WebP)
  favicon.*                         Favicon (solo el icono del logo)
assets/                             Originales sin optimizar (solo en local, ignorados por git)
```

## Qué editar

| Quiero cambiar…                    | Dónde                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------ |
| Link de compra de Hotmart          | `CHECKOUT_URL` al inicio de `200-recetas-para-diabeticos.astro`          |
| Precio, precio ancla y valor bonos | `PRICE_N`, `OLD_PRICE_N`, `BONUS_VALUES` en el mismo archivo             |
| Etiqueta que arranca el workflow   | `SYSTEME_IO_LEAD_TAG_ID` en `.env` (y en el hosting)                     |
| A dónde redirige tras el registro  | `SALES_PAGE_URL` en `CapturePage.tsx`                                    |
| Textos y SEO de ventas             | `title` y `description` al inicio de `200-recetas-para-diabeticos.astro` |
| Colores de la marca                | `@theme` en `src/styles/global.css`                                      |

> `OLD_PRICE_N` y `BONUS_VALUES` deben ser precios de referencia reales.

## Variables de entorno

Copia `.env.example` a `.env` y rellena:

| Variable                 | Qué es                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| `SYSTEME_IO_API_KEY`     | Clave de API de Systeme.io                                          |
| `SYSTEME_IO_LEAD_TAG_ID` | ID numérico de la etiqueta "Lead - 7 desayunos" (arranca workflow)  |
| `SITE_URL` (opcional)    | Dominio final, para canonical, `og:url` y sitemap                   |

Son secretos de servidor (`astro:env`): nunca llegan al navegador. **Añádelas también en el panel de tu hosting**, o el endpoint fallará en producción.

## SEO y dominio

Para activar canonical, `og:url`, datos estructurados y el sitemap con URLs absolutas, define el dominio al construir:

```bash
SITE_URL=https://tudominio.com pnpm build
```

## Notas

- El PDF se envía desde el workflow de Systeme.io (se dispara al asignar la etiqueta), no desde este proyecto.
- Si alguien se registra dos veces con el mismo email, no se repite la etiqueta y por tanto no se reenvía el PDF.
- `/api/lead` incluye validación de email, comprobación de origen, un campo honeypot anti-bots y tiempo límite de 8 s hacia Systeme.io. No tiene límite de peticiones por IP; si recibes spam, actívalo en el hosting (p. ej. Vercel Firewall).
- Las imágenes "sin fondo" originales de `assets/pagina_ventas/` (salvo `MOC,PIERDEPESO15DIAS`) traen el tablero de ajedrez pintado, no son transparentes.
- El material es educativo y culinario; no sustituye consejo médico.
