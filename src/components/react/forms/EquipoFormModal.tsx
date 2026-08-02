import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import ClienteSelect from './ClienteSelect';
import { useEquipoMutations } from '../../../lib/hooks/useEquipos';
import { ApiError } from '../../../lib/api/client';
import { TIPOS_EQUIPO, type Equipo, type EquipoPayload } from '../../../types/equipo';

interface EquipoFormModalProps {
  open: boolean;
  onClose: () => void;
  equipo?: Equipo | null;
  /** Preselecciona un cliente al crear (ej. desde la ficha del cliente). */
  defaultClienteId?: number | null;
  defaultClienteNombre?: string | null;
}

const emptyForm: EquipoPayload = {
  clienteId: 0,
  tipoEquipo: '',
  marca: '',
  modelo: '',
  numeroSerie: '',
  imei: '',
  color: '',
  estadoFisico: '',
  accesoriosRecibidos: '',
  observaciones: '',
};

export default function EquipoFormModal({
  open,
  onClose,
  equipo,
  defaultClienteId,
  defaultClienteNombre,
}: EquipoFormModalProps) {
  const isEdit = !!equipo;
  const { create, update } = useEquipoMutations();
  const [form, setForm] = useState<EquipoPayload>(emptyForm);
  const [clienteLabel, setClienteLabel] = useState<string>('');
  const [touchedCliente, setTouchedCliente] = useState(false);
  const mutation = isEdit ? update : create;

  useEffect(() => {
    if (!open) return;

    if (equipo) {
      setForm({
        clienteId: equipo.clienteId,
        tipoEquipo: equipo.tipoEquipo,
        marca: equipo.marca ?? '',
        modelo: equipo.modelo ?? '',
        numeroSerie: equipo.numeroSerie ?? '',
        imei: equipo.imei ?? '',
        color: equipo.color ?? '',
        estadoFisico: equipo.estadoFisico ?? '',
        accesoriosRecibidos: equipo.accesoriosRecibidos ?? '',
        observaciones: equipo.observaciones ?? '',
      });
      setClienteLabel(equipo.cliente?.nombre ?? '');
    } else {
      setForm({ ...emptyForm, clienteId: defaultClienteId ?? 0 });
      setClienteLabel(defaultClienteNombre ?? '');
    }

    setTouchedCliente(false);
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, equipo]);

  function set<K extends keyof EquipoPayload>(key: K, value: EquipoPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouchedCliente(true);

    if (!form.clienteId) return;

    const payload: EquipoPayload = {
      ...form,
      marca: form.marca || undefined,
      modelo: form.modelo || undefined,
      numeroSerie: form.numeroSerie || undefined,
      imei: form.imei || undefined,
      color: form.color || undefined,
      estadoFisico: form.estadoFisico || undefined,
      accesoriosRecibidos: form.accesoriosRecibidos || undefined,
      observaciones: form.observaciones || undefined,
    };

    if (isEdit && equipo) {
      update.mutate({ id: equipo.id, payload }, { onSuccess: onClose });
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  }

  const errorMessage =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar equipo' : 'Nuevo equipo'}>
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Cliente <span className="text-red-500">*</span>
          </label>
          <ClienteSelect
            value={form.clienteId || null}
            initialLabel={clienteLabel}
            onChange={(id, nombre) => {
              set('clienteId', id);
              setClienteLabel(nombre);
            }}
            error={touchedCliente && !form.clienteId ? 'Selecciona un cliente' : undefined}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">
              Tipo de equipo <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.tipoEquipo}
              onChange={(e) => set('tipoEquipo', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            >
              <option value="" disabled>
                Selecciona…
              </option>
              {TIPOS_EQUIPO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Color</label>
            <input
              type="text"
              value={form.color}
              onChange={(e) => set('color', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Marca</label>
            <input
              type="text"
              value={form.marca}
              onChange={(e) => set('marca', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Modelo</label>
            <input
              type="text"
              value={form.modelo}
              onChange={(e) => set('modelo', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">N.º de serie</label>
            <input
              type="text"
              value={form.numeroSerie}
              onChange={(e) => set('numeroSerie', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">IMEI</label>
            <input
              type="text"
              value={form.imei}
              onChange={(e) => set('imei', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Estado físico</label>
          <textarea
            rows={2}
            value={form.estadoFisico}
            onChange={(e) => set('estadoFisico', e.target.value)}
            placeholder="Ej. Pantalla con rayones leves, carcasa golpeada en esquina inferior…"
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Accesorios recibidos</label>
          <textarea
            rows={2}
            value={form.accesoriosRecibidos}
            onChange={(e) => set('accesoriosRecibidos', e.target.value)}
            placeholder="Ej. Cargador, funda, cable USB…"
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Observaciones</label>
          <textarea
            rows={2}
            value={form.observaciones}
            onChange={(e) => set('observaciones', e.target.value)}
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        )}

        <div className="sticky bottom-0 flex justify-end gap-2 bg-white pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Registrar equipo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
