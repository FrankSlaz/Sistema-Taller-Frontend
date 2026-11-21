import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { archivosApi } from '../../../../lib/api/archivos';

interface AuthImageProps {
  archivoId: number;
  alt: string;
  className?: string;
  /** false = no pedir la imagen todavía (ej. el usuario no tiene archivos:ver). */
  enabled?: boolean;
}

/**
 * <img> para imágenes que requieren autenticación. Un <img src="..."> no
 * puede mandar el header Authorization, así que la imagen se pide con
 * fetch (+ Bearer token), se cachea el Blob en TanStack Query (el
 * contenido de un id nunca cambia → staleTime infinito) y se muestra
 * mediante un object URL que se libera al desmontar.
 */
export default function AuthImage({ archivoId, alt, className, enabled = true }: AuthImageProps) {
  const { data: blob, isError } = useQuery({
    queryKey: ['archivo-blob', archivoId],
    queryFn: () => archivosApi.contenido(archivoId),
    enabled,
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  if (isError) {
    return (
      <div className={`flex items-center justify-center bg-graphite-100 text-graphite-400 ${className ?? ''}`}>
        <ImageOff size={18} aria-label="Sin vista previa" />
      </div>
    );
  }

  if (!url) {
    return <div className={`animate-pulse bg-graphite-100 ${className ?? ''}`} />;
  }

  return <img src={url} alt={alt} className={className} />;
}
