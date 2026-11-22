import * as Tooltip from '@radix-ui/react-tooltip';
import { createContext, useContext, type PropsWithChildren, type ReactElement, type ReactNode } from 'react';

/**
 * Etiqueta flotante (tooltip) de los botones de acción, con Radix Tooltip.
 * Frente al `title` nativo: aparece rápido, al pasar a un botón vecino se
 * muestra de inmediato, funciona con teclado (foco) y sigue el estilo del
 * sistema.
 *
 * Uso: <Tip label="Editar"><button …><Pencil /></button></Tip>
 * El hijo debe ser un único elemento que acepte ref (button, a…).
 */

const RETRASO_MS = 150; // antes de mostrar la primera
const SALTO_MS = 400; // ventana en la que el siguiente se muestra sin retraso

const ConProveedor = createContext(false);

/** Proveedor compartido de la isla: comparte el "salto" entre etiquetas. */
export function TipProvider({ children }: PropsWithChildren) {
  return (
    <Tooltip.Provider delayDuration={RETRASO_MS} skipDelayDuration={SALTO_MS}>
      <ConProveedor.Provider value={true}>{children}</ConProveedor.Provider>
    </Tooltip.Provider>
  );
}

export default function Tip({
  label,
  children,
  side = 'top',
}: {
  label: ReactNode;
  children: ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  const hayProveedor = useContext(ConProveedor);
  if (label === null || label === undefined || label === '') return children;

  const tip = (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side={side}
          sideOffset={6}
          collisionPadding={8}
          className="z-[100] max-w-xs select-none rounded-md bg-graphite-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
        >
          {label}
          <Tooltip.Arrow className="fill-graphite-900" width={10} height={5} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );

  // Islas sin TipProvider (menú de usuario, login…): proveedor propio.
  return hayProveedor ? tip : <TipProvider>{tip}</TipProvider>;
}
