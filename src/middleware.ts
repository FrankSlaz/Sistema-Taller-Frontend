import { defineMiddleware } from 'astro:middleware';
import { obtenerBranding } from './lib/branding';

/**
 * Deja la marca del taller (nombre + logo) en Astro.locals.branding para
 * que BaseLayout, Sidebar, Navbar y Login la lean sin repetir la consulta.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  // El proxy del logo no renderiza HTML: no necesita la marca.
  if (!context.url.pathname.startsWith('/marca/')) {
    context.locals.branding = await obtenerBranding();
  }
  return next();
});
