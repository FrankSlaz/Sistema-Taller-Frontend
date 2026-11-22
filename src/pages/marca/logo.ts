import type { APIRoute } from 'astro';
import { PUBLIC_API_URL } from 'astro:env/client';

/**
 * Logo del taller servido desde el MISMO origen que el frontend (proxy de
 * GET /configuracion/logo del backend). Así el logo funciona aunque el
 * navegador no pueda llegar directo al backend: p. ej. el celular de un
 * cliente que abre su enlace de seguimiento, el ícono de la pestaña o la
 * vista previa del enlace en WhatsApp.
 */
export const GET: APIRoute = async () => {
  try {
    const res = await fetch(`${PUBLIC_API_URL}/configuracion/logo`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok || !res.body) return new Response(null, { status: 404 });
    return new Response(res.body, {
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'image/png',
        // La URL lleva ?v=<versión>: se puede cachear sin miedo.
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
};
