# Vividia · Recetas para diabéticos

Embudo de dos páginas para captar emails con un PDF gratis y llevar a la compra del pack en Hotmart.

1. **`/`** Página de captura: 7 desayunos en PDF gratis. Un popup pide solo el email.
2. **`/200-recetas-para-diabeticos`** Página de ventas: 200+ recetas y 5 bonos, con botón al checkout de Hotmart.

Tras registrarse en la captura, el usuario es redirigido a la página de ventas.

## Stack

Astro · React · Tailwind CSS v4 · pnpm

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
| Formulario de email (Systeme.io)   | `SUBSCRIPTION_URL` en `CapturePage.tsx`                                  |
| A dónde redirige tras el registro  | `SALES_PAGE_URL` en `CapturePage.tsx`                                    |
| Textos y SEO de ventas             | `title` y `description` al inicio de `200-recetas-para-diabeticos.astro` |
| Colores de la marca                | `@theme` en `src/styles/global.css`                                      |

> `OLD_PRICE_N` y `BONUS_VALUES` deben ser precios de referencia reales.

## SEO y dominio

Para activar canonical, `og:url`, datos estructurados y el sitemap con URLs absolutas, define el dominio al construir:

```bash
SITE_URL=https://tudominio.com pnpm build
```

## Notas

- El PDF gratuito (`public/assets/Vividia_7_desayunos.pdf`) no se envía solo: la entrega por email debe configurarse en Systeme.io.
- El formulario envía el email a Systeme.io con `fetch` (modo `no-cors`), por lo que la página no puede confirmar si el alta fue exitosa.
- Las imágenes "sin fondo" originales de `assets/pagina_ventas/` (salvo `MOC,PIERDEPESO15DIAS`) traen el tablero de ajedrez pintado, no son transparentes.
- El material es educativo y culinario; no sustituye consejo médico.
