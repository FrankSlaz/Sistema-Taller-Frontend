/**
 * Espejo de backend-nest/src/modules/backups (solo Administrador).
 * Cada backup es un volcado completo de la base (.sql.gz).
 */

export type TipoBackup = 'manual' | 'pre-restauracion' | 'subido';

export interface Backup {
  nombre: string;
  /** Bytes (comprimido). */
  tamano: number;
  fecha: string;
  tipo: TipoBackup;
}

export interface RestaurarResultado {
  restaurado: string;
  /** Backup automático del estado anterior, por si hay que deshacer. */
  backupSeguridad: string;
}
