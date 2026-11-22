import { PUBLIC_API_URL, PUBLIC_APP_NAME } from 'astro:env/client';

export interface Branding {
  nombreTaller: string;
  /** URL pública del logo (con ?v= para invalidar caché), o null si no hay. */
  logoUrl: string | null;
}

interface ConfiguracionPublica {
  nombreTaller: string;
  tieneLogo: boolean;
  logoVersion: string | null;
}

export const BRANDING_POR_DEFECTO: Branding = { nombreTaller: PUBLIC_APP_NAME, logoUrl: null };

export function logoUrlDe(logoVersion: string | null, tieneLogo: boolean): string | null {
  // Ruta del propio frontend (src/pages/marca/logo.ts, proxy al backend):
  // funciona desde cualquier dispositivo que pueda abrir la página.
  return tieneLogo ? `/marca/logo?v=${logoVersion ?? '1'}` : null;
}

/**
 * Lee nombre y logo del taller desde GET /configuracion/publica (ruta
 * pública del backend). Se usa en el SERVIDOR (middleware de Astro) para
 * que título, favicon y logo lleguen ya en el HTML, sin parpadeo.
 *
 * Si el backend no responde, la página igual se renderiza con el nombre
 * por defecto (PUBLIC_APP_NAME): la marca nunca debe tumbar la app.
 */
export async function obtenerBranding(): Promise<Branding> {
  try {
    const response = await fetch(`${PUBLIC_API_URL}/configuracion/publica`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return BRANDING_POR_DEFECTO;
    const json = (await response.json()) as { data: ConfiguracionPublica };
    return {
      nombreTaller: json.data.nombreTaller || PUBLIC_APP_NAME,
      logoUrl: logoUrlDe(json.data.logoVersion, json.data.tieneLogo),
    };
  } catch {
    return BRANDING_POR_DEFECTO;
  }
}
