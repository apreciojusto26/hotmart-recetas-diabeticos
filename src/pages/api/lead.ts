import type { APIRoute } from 'astro';
import { SYSTEME_IO_API_KEY, SYSTEME_IO_LEAD_TAG_ID } from 'astro:env/server';

// Esta ruta corre en servidor; el resto del sitio sigue siendo estático.
export const prerender = false;

const SYSTEME_API = 'https://api.systeme.io/api';
const TIMEOUT_MS = 8000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SystemeContact = { id: number; email?: string; tags?: { id: number }[] };

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const systeme = (path: string, init: { method?: string; body?: unknown; contentType?: string } = {}) =>
  fetch(`${SYSTEME_API}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      'X-API-Key': SYSTEME_IO_API_KEY,
      Accept: 'application/json',
      ...(init.body !== undefined && { 'Content-Type': init.contentType ?? 'application/json' }),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

// Error con el paso que falló y lo que respondió Systeme.io (recortado): es lo que necesitamos para diagnosticar.
async function fail(step: string, res: Response): Promise<never> {
  const detail = (await res.text().catch(() => '')).slice(0, 300);
  throw new Error(`${step}: HTTP ${res.status} ${detail}`);
}

async function findContact(email: string): Promise<SystemeContact | undefined> {
  const res = await systeme(`/contacts?email=${encodeURIComponent(email)}`);
  if (!res.ok) await fail('buscar contacto', res);
  const data = (await res.json()) as { items?: SystemeContact[] };
  // Comparamos el email exacto: no nos fiamos de que el filtro sea estricto.
  return data.items?.find((c) => c.email?.toLowerCase() === email);
}

async function createContact(email: string, name: string): Promise<SystemeContact> {
  const res = await systeme('/contacts', {
    method: 'POST',
    body: {
      email,
      locale: 'es',
      fields: name ? [{ slug: 'first_name', value: name }] : [],
    },
  });

  if (res.ok) return (await res.json()) as SystemeContact;

  // Si dos peticiones llegan a la vez, la segunda choca con el contacto ya creado: lo recuperamos.
  if (res.status === 409 || res.status === 422) {
    const existing = await findContact(email);
    if (existing) return existing;
  }
  return fail('crear contacto', res);
}

export const POST: APIRoute = async ({ request, url }) => {
  // Solo aceptamos peticiones que vengan de nuestro propio sitio.
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== url.host) {
    return json({ ok: false, error: 'Origen no permitido' }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Petición no válida' }, 400);
  }

  // Honeypot: un campo oculto que las personas nunca rellenan. Respondemos "ok" para no dar pistas al bot.
  if (String(body.hp ?? '').trim() !== '') {
    console.warn('[lead] honeypot activado: petición ignorada (¿autocompletado del navegador?)');
    return json({ ok: true });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  const name = String(body.name ?? '').trim().slice(0, 100);

  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'Introduce un email válido' }, 400);
  }

  try {
    let contact = await findContact(email);
    const isNew = !contact;

    if (!contact) {
      contact = await createContact(email, name);
    } else if (name) {
      // Actualizar el nombre es "best effort": si falla, no bloqueamos el registro.
      systeme(`/contacts/${contact.id}`, {
        method: 'PATCH',
        contentType: 'application/merge-patch+json',
        body: { fields: [{ slug: 'first_name', value: name }] },
      }).catch((error) => console.error('Systeme.io: no se pudo actualizar el nombre', error));
    }

    // Un contacto recién creado no tiene etiquetas; en uno existente las comprobamos para no repetir la etiqueta.
    let alreadyTagged = false;
    if (!isNew) {
      let tags = contact.tags;
      if (!Array.isArray(tags)) {
        const res = await systeme(`/contacts/${contact.id}`);
        if (!res.ok) await fail('leer contacto', res);
        tags = ((await res.json()) as SystemeContact).tags ?? [];
      }
      alreadyTagged = tags.some((tag) => Number(tag.id) === SYSTEME_IO_LEAD_TAG_ID);
    }

    // Añadir la etiqueta es lo que arranca el workflow (envío del PDF + emails).
    if (!alreadyTagged) {
      const res = await systeme(`/contacts/${contact.id}/tags`, {
        method: 'POST',
        body: { tagId: SYSTEME_IO_LEAD_TAG_ID },
      });
      if (!res.ok) await fail('asignar etiqueta', res);
    }

    // Sin el email en el log (dato personal): solo el resultado.
    console.info(
      `[lead] ok: contacto ${contact.id} ${isNew ? 'creado' : 'existente'}, etiqueta ${alreadyTagged ? 'ya estaba' : 'asignada'}`,
    );
    return json({ ok: true });
  } catch (error) {
    // Al servidor van los detalles; al navegador, un mensaje genérico.
    console.error('Systeme.io /api/lead:', error);
    const generic = 'No pudimos completar el registro. Inténtalo de nuevo.';
    // Solo en desarrollo enseñamos la causa real; en producción, un mensaje genérico.
    const message = import.meta.env.DEV ? `${generic} [${String(error).slice(0, 250)}]` : generic;
    return json({ ok: false, error: message }, 502);
  }
};
