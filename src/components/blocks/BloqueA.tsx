import { TextInput } from '../ui/Input';
import type { BloqueAData } from '../../types';

interface Props {
  data: BloqueAData;
  onChange?: (patch: Partial<BloqueAData>) => void;
  readOnly?: boolean;
  showContactNote?: boolean;
  // Nombre del Enlace tomado del perfil con sesión iniciada (profiles.nombre).
  // Cuando se pasa, sustituye al vestigial form_data.bloque_a.titular_sesea
  // (F1.12). El admin no lo pasa: ahí se muestra el Enlace del reporte.
  enlaceNombre?: string;
}

const TRIMESTRE_LABELS: Record<string, string> = { '1': 'Primer', '2': 'Segundo', '3': 'Tercer', '4': 'Cuarto' };
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Etiqueta legible a partir del id del período ('YYYY-Qn' | 'YYYY-Mnn'). Antes
// era un mapa fijo 2026-Q1..Q4; ahora resuelve cualquier año y los mensuales.
function periodoLabel(id: string): string {
  const q = /^(\d{4})-Q([1-4])$/.exec(id);
  if (q) return `${TRIMESTRE_LABELS[q[2]]} Trimestre ${q[1]}`;
  const m = /^(\d{4})-M(\d{2})$/.exec(id);
  if (m) return `${MESES[Number(m[2]) - 1] ?? m[2]} ${m[1]}`;
  return id;
}

export function BloqueA({ data, onChange, readOnly = true, showContactNote = true, enlaceNombre }: Props) {
  const set = (patch: Partial<BloqueAData>) => !readOnly && onChange?.(patch);
  const enlace = enlaceNombre ?? data.titular_sesea;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        {readOnly
          ? 'Los datos de identificación se configuran automáticamente. No es necesario capturarlos.'
          : 'Edite los datos de identificación de la entidad.'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextInput
          label="Entidad federativa"
          value={data.entidad}
          onChange={e => set({ entidad: e.target.value })}
          readOnly={readOnly}
          required
        />
        <TextInput
          label="Período de reporte"
          value={periodoLabel(data.periodo)}
          readOnly
          required
        />
        <TextInput
          label="Enlace"
          value={enlace}
          onChange={e => set({ titular_sesea: e.target.value })}
          readOnly={readOnly || enlaceNombre !== undefined}
          required
          className="md:col-span-2"
        />
      </div>
      {readOnly && showContactNote && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
          <p className="text-xs text-blue-700">
            Si existe algún error en los datos anteriores, favor de comunicarse con la Secretaría Ejecutiva del Sistema Nacional Anticorrupción al correo <strong>mcalvarado@sesna.gob.mx</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
