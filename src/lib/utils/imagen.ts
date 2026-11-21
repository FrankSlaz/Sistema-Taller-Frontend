const MAX_LADO_PX = 1600;
const CALIDAD_JPEG = 0.85;
const UMBRAL_BYTES = 1.5 * 1024 * 1024;

/**
 * Reduce una foto antes de subirla: una foto de celular pesa 3–8 MB y
 * tiene 4000+ px, de sobra para identificar un equipo. Se redimensiona
 * a máx. 1600 px por lado y se recodifica a JPEG.
 *
 * Nunca falla: si el navegador no soporta createImageBitmap, si la imagen
 * no se puede decodificar, o si el resultado no mejora el original, se
 * devuelve el archivo tal cual (el backend igual valida el contenido real).
 * Se procesan de a una (no en paralelo): una foto de 12 MP decodificada
 * ocupa ~48 MB de memoria y diez a la vez colgarían un celular.
 */
export async function reducirImagen(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || typeof createImageBitmap === 'undefined') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const escala = Math.min(1, MAX_LADO_PX / Math.max(width, height));

    // Ya es chica y liviana: no recomprimir (cada recompresión pierde calidad).
    if (escala === 1 && file.size <= UMBRAL_BYTES && file.type === 'image/jpeg') {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * escala);
    canvas.height = Math.round(height * escala);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', CALIDAD_JPEG));
    if (!blob || (escala === 1 && blob.size >= file.size)) return file;

    const nombre = `${file.name.replace(/\.[^.]+$/, '')}.jpg`;
    return new File([blob], nombre, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
