import { Toggle } from '../ui/Toggle';
import { Textarea } from '../ui/Input';
import type { BloqueIData, CambioNormativo } from '../../types';

interface Props {
  data: BloqueIData;
  onChange?: (patch: Partial<BloqueIData>) => void;
  readOnly?: boolean;
}

type LeyKey = keyof BloqueIData;

const MAX_DESCRIPCION = 800;

const LEYES: { key: LeyKey; siglas: string; nombre: string }[] = [
  { key: 'constitucion', siglas: 'CL',     nombre: 'Constitución Local' },
  { key: 'cpe',          siglas: 'CPE',    nombre: 'Código Penal Estatal' },
  { key: 'lfs',          siglas: 'LFS',    nombre: 'Legislación de Fiscalización Superior' },
  { key: 'lea',          siglas: 'LEA',    nombre: 'Ley Estatal Anticorrupción' },
  { key: 'loape',        siglas: 'LOAPE',  nombre: 'Ley Orgánica de la Administración Pública Estatal' },
  { key: 'lofgl',        siglas: 'LOFGL',  nombre: 'Ley Orgánica de la Fiscalía General Local' },
  { key: 'lotjae',       siglas: 'LOTJAE', nombre: 'Ley Orgánica del Tribunal de Justicia Administrativa Estatal' },
  { key: 'lrae',         siglas: 'LRAE',   nombre: 'Ley de Responsabilidades Administrativas Estatal' },
];

export function BloqueI({ data, onChange, readOnly }: Props) {
  const setLey = (key: LeyKey, patch: Partial<CambioNormativo>) => {
    if (readOnly) return;
    onChange?.({ [key]: { ...data[key], ...patch } } as Partial<BloqueIData>);
  };

  const conCambios = LEYES.filter(l => data[l.key].tuvo_cambios === true).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 max-w-xl">
        Señale si ha habido cambios normativos directamente vinculados a la conformación y funcionamiento del SEA, durante el segundo trimestre de 2026, en las siguientes disposiciones.
        </p>
        {conCambios > 0 && (
          <span className="shrink-0 ml-4 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            {conCambios} {conCambios === 1 ? 'ley con cambios' : 'leyes con cambios'}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {LEYES.map(ley => {
          const cambio = data[ley.key];
          return (
            <div key={ley.key} className={`card p-5 transition-all ${cambio.tuvo_cambios === true ? 'border-amber-200 bg-amber-50/30' : ''}`}>
              <div className="flex items-start gap-3 mb-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-guinda-50 text-guinda-950 border border-guinda-100 shrink-0">
                  {ley.siglas}
                </span>
                <p className="text-sm font-medium text-gray-800 leading-snug">{ley.nombre}</p>
              </div>
              <div className="space-y-4">
                <Toggle
                  label="¿Esta ley tuvo modificaciones durante el período?"
                  value={cambio.tuvo_cambios}
                  onChange={v => setLey(ley.key, { tuvo_cambios: v, descripcion: v ? cambio.descripcion : '' })}
                  required
                  disabled={readOnly}
                />
                {cambio.tuvo_cambios === true && (
                  <Textarea
                    label="Descripción de las modificaciones"
                    value={cambio.descripcion}
                    onChange={e => setLey(ley.key, { descripcion: e.target.value.slice(0, MAX_DESCRIPCION) })}
                    required
                    readOnly={readOnly}
                    rows={3}
                    maxLength={MAX_DESCRIPCION}
                    hint="Máximo 800 caracteres"
                    placeholder="Describa brevemente qué artículos se modificaron y el alcance del cambio..."
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
