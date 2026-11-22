import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Monta su contenido recién cuando está por entrar en pantalla (o al pasar
 * a la pestaña). Para páginas largas con muchos paneles: la primera
 * pantalla se dibuja antes y los de abajo se cargan al acercarse con el
 * scroll, con margen suficiente para que ya estén listos al llegar (y sin
 * saltos visibles, porque se arman fuera de la vista).
 */
export default function Diferido({
  children,
  altoReservado = 160,
  margen = '600px',
}: {
  children: ReactNode;
  /** Alto aproximado mientras no se monta. */
  altoReservado?: number;
  margen?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: margen },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible, margen]);

  if (visible) return <>{children}</>;
  return <div ref={ref} style={{ minHeight: altoReservado }} aria-busy="true" />;
}
