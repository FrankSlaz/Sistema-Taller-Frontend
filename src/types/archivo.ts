/**
 * Espejo de backend-nest/src/modules/archivos-equipo
 * Fotos de un equipo, opcionalmente vinculadas a una orden de reparación
 * (registro fotográfico de lo que se hizo). rutaArchivo nunca llega al
 * cliente: las imágenes se piden por id a /archivos-equipo/:id/contenido.
 */

export interface ArchivoOrdenRef {
  id: number;
  codigoOrden: string | null;
}

export interface ArchivoEquipo {
  id: number;
  equipoId: number;
  ordenId: number | null;
  orden: ArchivoOrdenRef | null;
  nombreArchivo: string | null;
  tipoArchivo: string | null;
  descripcion: string | null;
  createdAt: string | null;
}

export interface UploadArchivosPayload {
  files: File[];
  ordenId?: number;
  descripcion?: string;
}

/** Mismo límite que el backend (MAX_ARCHIVOS). */
export const MAX_ARCHIVOS_POR_SUBIDA = 10;
