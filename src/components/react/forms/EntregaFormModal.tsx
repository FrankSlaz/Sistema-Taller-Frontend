import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, FileDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import OrdenSelect from './OrdenSelect';
import EntregaForm from './EntregaForm';
import { useReparacion } from '../../../lib/hooks/useReparaciones';
import { entregasApi } from '../../../lib/api/entregas';
import type { EntregaCreada } from '../../../types/entrega';

interface EntregaFormModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Registrar una entrega desde el módulo Entregas: se elige la orden y se usa
 * el mismo formulario (con las mismas reglas) que en el detalle de la orden.
 */
export default function EntregaFormModal({ open, onClose }: EntregaFormModalProps) {
  const [ordenId, setOrdenId] = useState(0);
  const [ordenLabel, setOrdenLabel] = useState('');
  const [creada, setCreada] = useState<EntregaCreada | null>(null);
  const { data: orden, isLoading } = useReparacion(ordenId);
  const acta = useMutation({
    mutationFn: () => entregasApi.acta(creada!.id, creada!.orden?.codigoOrden ?? String(creada!.ordenId)),
  });

  useEffect(() => {
    if (!open) return;
    setOrdenId(0);
    setOrdenLabel('');
    setCreada(null);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Registrar entrega">
      {creada ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 size={40} className="mx-auto text-green-600" />
          <div>
            <p className="font-semibold text-graphite-900">
              {creada.devolucion ? 'Devolución registrada' : 'Entrega registrada'}
            </p>
            {creada.garantia && (
              <p className="text-sm text-graphite-500">
                Garantía de {creada.garantia.dias} días, hasta el{' '}
                {new Date(creada.garantia.fechaFin).toLocaleDateString('es-BO')}.
              </p>
            )}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => acta.mutate()}
              disabled={acta.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
            >
              {acta.isPending ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
              Descargar acta
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">
              Orden <span className="text-red-500">*</span>
            </label>
            <OrdenSelect
              value={ordenId || null}
              initialLabel={ordenLabel}
              onChange={(id, label) => {
                setOrdenId(id);
                setOrdenLabel(label);
              }}
            />
          </div>
          {ordenId > 0 &&
            (isLoading || !orden ? (
              <div className="h-40 animate-pulse rounded-md bg-graphite-100" />
            ) : orden.entrega ? (
              <p className="rounded-md bg-graphite-50 px-3 py-2 text-sm text-graphite-600">
                Esta orden ya tiene una entrega registrada.
              </p>
            ) : (
              <EntregaForm key={orden.id} orden={orden} onDone={setCreada} />
            ))}
        </div>
      )}
    </Modal>
  );
}
