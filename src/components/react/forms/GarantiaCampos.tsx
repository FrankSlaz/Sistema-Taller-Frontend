const inputCls =
  'w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800';

const ATAJOS = [30, 60, 90, 180];

export interface GarantiaValor {
  /** null = todavía no eligió con/sin garantía. */
  conGarantia: boolean | null;
  dias: number;
  condiciones: string;
}

/**
 * Garantía de la reparación: la define el técnico o el administrador al
 * terminar el trabajo. Se usa en "Cambiar estado" (al pasar a Listo para
 * entrega) y en el panel Garantía (definir/corregir antes de entregar).
 */
export default function GarantiaCampos({
  valor,
  onChange,
  condicionesGenerales,
}: {
  valor: GarantiaValor;
  onChange: (v: GarantiaValor) => void;
  condicionesGenerales?: string | null;
}) {
  const set = (parcial: Partial<GarantiaValor>) => onChange({ ...valor, ...parcial });
  const opcion = (activa: boolean) =>
    `flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
      activa ? 'border-graphite-900 bg-graphite-900 text-white' : 'border-graphite-200 text-graphite-700 hover:border-graphite-400'
    }`;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => set({ conGarantia: true })} className={opcion(valor.conGarantia === true)}>
          Con garantía
        </button>
        <button type="button" onClick={() => set({ conGarantia: false })} className={opcion(valor.conGarantia === false)}>
          Sin garantía
        </button>
      </div>

      {valor.conGarantia && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Tiempo de garantía (días)</label>
            <div className="flex flex-wrap items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={730}
                value={valor.dias || ''}
                onChange={(e) => set({ dias: Math.min(730, Math.max(0, Math.trunc(Number(e.target.value)))) })}
                className="w-20 rounded-md border border-graphite-200 px-2 py-1.5 text-sm"
              />
              {ATAJOS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set({ dias: d })}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    valor.dias === d ? 'border-graphite-900 bg-graphite-900 text-white' : 'border-graphite-200 text-graphite-600 hover:border-graphite-400'
                  }`}
                >
                  {d} d
                </button>
              ))}
            </div>
            {valor.dias < 1 && <p className="mt-1 text-xs text-red-600">Indica al menos 1 día.</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Qué cubre / condiciones (opcional)</label>
            <textarea
              rows={2}
              value={valor.condiciones}
              onChange={(e) => set({ condiciones: e.target.value })}
              placeholder="Ej. Cubre la pantalla instalada. No cubre golpes ni humedad."
              className={`${inputCls} resize-none text-xs`}
            />
            {!valor.condiciones.trim() && condicionesGenerales && (
              <p className="mt-1 text-[11px] text-graphite-400">Si lo dejas vacío se usan las condiciones generales de Configuración.</p>
            )}
          </div>
        </>
      )}
      {valor.conGarantia === false && (
        <p className="text-xs text-graphite-500">El equipo se entregará sin garantía y así constará en el acta.</p>
      )}
    </div>
  );
}

/** ¿Está completa la elección? */
export function garantiaValida(v: GarantiaValor) {
  return v.conGarantia === false || (v.conGarantia === true && v.dias >= 1);
}

/** Valor → payload del backend. */
export function garantiaPayload(v: GarantiaValor) {
  return v.conGarantia
    ? { garantiaDias: v.dias, garantiaCondiciones: v.condiciones.trim() || undefined }
    : { garantiaDias: 0 };
}

/** Valor inicial a partir de lo que ya tenga la orden o del valor por defecto. */
export function garantiaInicial(dias: number | null | undefined, condiciones: string | null | undefined, porDefecto: number): GarantiaValor {
  if (dias === null || dias === undefined) return { conGarantia: null, dias: porDefecto || 30, condiciones: '' };
  return dias > 0
    ? { conGarantia: true, dias, condiciones: condiciones ?? '' }
    : { conGarantia: false, dias: porDefecto || 30, condiciones: '' };
}
