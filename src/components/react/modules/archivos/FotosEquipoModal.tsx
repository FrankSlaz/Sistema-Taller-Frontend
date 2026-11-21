import Modal from '../../ui/Modal';
import FotosGaleria from './FotosGaleria';
import type { Equipo } from '../../../../types/equipo';

interface FotosEquipoModalProps {
  equipo: Equipo | null;
  onClose: () => void;
}

/** Galería general de un equipo (fotos de identificación + las de todas sus órdenes). */
export default function FotosEquipoModal({ equipo, onClose }: FotosEquipoModalProps) {
  if (!equipo) return null;

  const nombre = [equipo.tipoEquipo, equipo.marca, equipo.modelo].filter(Boolean).join(' ');

  return (
    <Modal open={!!equipo} onClose={onClose} title={`Fotos · ${nombre}`} size="xl">
      <div className="max-h-[75vh] overflow-y-auto pr-1">
        <FotosGaleria equipoId={equipo.id} />
      </div>
    </Modal>
  );
}
