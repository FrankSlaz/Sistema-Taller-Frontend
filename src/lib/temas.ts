/**
 * Paletas de colores del sistema (las elige el administrador en
 * Configuración, para todo el taller). Cada una reemplaza la escala
 * "graphite" que usa toda la interfaz (barra lateral, botones, textos,
 * bordes), con la MISMA luminosidad que la original: solo cambia el matiz,
 * así los contrastes se mantienen (texto suave sobre blanco >= 4.5:1, texto
 * principal y botones >= 7:1). Los colores de estado (verde, rojo, ámbar)
 * no cambian, para que sigan significando lo mismo.
 *
 * Generadas en OKLCH a partir de la escala grafito.
 */
export const PASOS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export interface Tema {
  id: string;
  nombre: string;
  colores: Record<(typeof PASOS)[number], string>;
}

export const TEMAS: Tema[] = [
  {
    id: "grafito",
    nombre: "Grafito",
    colores: { 50: '#f7f7f8', 100: '#eceef1', 200: '#d1d5db', 300: '#a3a8b2', 400: '#6b7280', 500: '#545b68', 600: '#3c4250', 700: '#2b303a', 800: '#1f232b', 900: '#16191f', 950: '#0f1115' },
  },
  {
    id: "azul-marino",
    nombre: "Azul marino",
    colores: { 50: '#f5f7fa', 100: '#eaeef4', 200: '#cfd5df', 300: '#9ea9b8', 400: '#637084', 500: '#4c5c72', 600: '#32435c', 700: '#1e304c', 800: '#10233e', 900: '#071932', 950: '#041126' },
  },
  {
    id: "verde-bosque",
    nombre: "Verde bosque",
    colores: { 50: '#f5f8f6', 100: '#eaf0ec', 200: '#ced7d1', 300: '#9daca3', 400: '#617569', 500: '#4a6153', 600: '#2f493a', 700: '#193727', 800: '#092a19', 900: '#011f10', 950: '#00160a' },
  },
  {
    id: "vino",
    nombre: "Vino",
    colores: { 50: '#faf6f6', 100: '#f3ecec', 200: '#ddd1d2', 300: '#b5a3a4', 400: '#80696b', 500: '#6d5355', 600: '#56393c', 700: '#452529', 800: '#37181c', 900: '#2b0e13', 950: '#20080c' },
  },
  {
    id: "petroleo",
    nombre: "Petróleo",
    colores: { 50: '#f4f8f9', 100: '#e8eff1', 200: '#ccd7d9', 300: '#99acb0', 400: '#5c7579', 500: '#436166', 600: '#25484e', 700: '#09363d', 800: '#00292f', 900: '#011d22', 950: '#001418' },
  },
  {
    id: "cafe",
    nombre: "Café",
    colores: { 50: '#f9f7f5', 100: '#f2ede9', 200: '#dbd3ce', 300: '#b2a59c', 400: '#7d6c61', 500: '#6a564a', 600: '#523d2f', 700: '#412a1a', 800: '#331d0c', 900: '#281304', 950: '#1d0c02' },
  },
];

export const TEMA_POR_DEFECTO = 'grafito';

export function temaPorId(id?: string | null): Tema {
  return TEMAS.find((t) => t.id === id) ?? TEMAS[0];
}

/** CSS que reemplaza la escala grafito (se inserta en el <head>). */
export function cssDeTema(id?: string | null): string {
  const t = temaPorId(id);
  if (t.id === TEMA_POR_DEFECTO) return '';
  const vars = PASOS.map((p) => `--color-graphite-${p}:${t.colores[p]}`).join(';');
  return `html:root{${vars}}`;
}

/** Vista previa en vivo (Configuración): pinta la paleta elegida sin guardar. */
export function aplicarTema(id?: string | null) {
  const t = temaPorId(id);
  const raiz = document.documentElement;
  for (const p of PASOS) raiz.style.setProperty(`--color-graphite-${p}`, t.colores[p]);
}

/** Quita la vista previa: vuelve la paleta guardada (la que puso el servidor). */
export function quitarVistaPrevia() {
  const raiz = document.documentElement;
  for (const p of PASOS) raiz.style.removeProperty(`--color-graphite-${p}`);
}
