import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type PropsWithChildren } from 'react';
import { TipProvider } from '../ui/Tip';

/**
 * Proveedor de TanStack Query para las islas de React.
 * Cada isla que necesite datos del backend debe envolverse con
 * este provider (una instancia de QueryClient por isla montada,
 * ya que Astro Islands se hidratan de forma independiente).
 */
export default function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // TipProvider: las etiquetas de los botones de la isla comparten el
  // "salto" (al pasar de un botón a otro aparece sin esperar).
  return (
    <QueryClientProvider client={queryClient}>
      <TipProvider>{children}</TipProvider>
    </QueryClientProvider>
  );
}
