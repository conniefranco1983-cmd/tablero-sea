import { NumberInput } from '../ui/Input';
import type { BloqueGData } from '../../types';

interface Props {
  data: BloqueGData;
  onChange?: (patch: Partial<BloqueGData>) => void;
  readOnly?: boolean;
}

const AREAS = [
  { key: 'plazas_politica_publica',    label: 'Política Pública',      descripcion: 'Área de diseño y seguimiento de política anticorrupción' },
  { key: 'plazas_plataforma_digital',  label: 'Plataforma Digital Estatal',            descripcion: 'Área de tecnología e información' },
  { key: 'plazas_juridico_admin',      label: 'Jurídico y Administración',             descripcion: 'Área legal y de gestión administrativa' },
  { key: 'plazas_titular',             label: 'Oficina del Titular',                   descripcion: 'Personal adscrito directamente a la Oficina del Titular de la SESEA' },
  { key: 'plazas_otra',                label: 'Otra área',                             descripcion: 'Plazas no comprendidas en las categorías anteriores' },
] as const;

export function BloqueG({ data, onChange, readOnly }: Props) {
  const set = (patch: Partial<BloqueGData>) => !readOnly && onChange?.(patch);
  const total = AREAS.reduce((acc, a) => acc + (Number(data[a.key]) || 0), 0);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Registre el número total de plazas, tanto vacantes como ocupadas, por área funcional al cierre del período.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {AREAS.map(area => (
          <div key={area.key} className="card p-4">
            <p className="text-xs text-gray-500 mb-3">{area.descripcion}</p>
            <NumberInput
              label={area.label}
              value={data[area.key]}
              onChange={v => set({ [area.key]: v } as Partial<BloqueGData>)}
              required
              disabled={readOnly}
              min={0}
            />
          </div>
        ))}
      </div>

      <div className="card p-4 flex items-center justify-between bg-gray-50">
        <span className="text-sm font-medium text-gray-700">Total de plazas</span>
        <span className="text-lg font-semibold text-gray-900">{total}</span>
      </div>
    </div>
  );
}
