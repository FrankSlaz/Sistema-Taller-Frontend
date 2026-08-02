import { clsx, type ClassValue } from 'clsx';

/**
 * Combina clases condicionalmente. Se usa en todos los
 * componentes Astro y React del proyecto.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
