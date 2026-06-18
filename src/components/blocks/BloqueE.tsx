import { Select } from '../ui/Select';
import { NumberInput } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import type { BloqueEData } from '../../types';

interface Props {
  data: BloqueEData;
  onChange?: (patch: Partial<BloqueEData>) => void;
  readOnly?: boolean;
  tieneCRSF?: boolean;
  tieneCS?: boolean;
  ccAplica?: boolean | null;
  crsfAplica?: boolean | null;
}

const ORGANOS = [
  { key: 'cc',   label: 'Comité Coordinador (CC)' },
  { key: 'ce',   label: 'Comisión Ejecutiva (CE)' },
  { key: 'crsf', label: 'Comité Rector del Sistema de Fiscalización (CRSF)' },
] as const;

const SESION_OPTIONS = [
  { value: '1_a_6_meses',    label: '1 a 6 meses' },
  { value: '6_meses_1_año',  label: '6 meses a 1 año' },
  { value: 'mas_1_año',      label: 'Más de 1 año' },
  { value: 'no_aplica',      label: 'No aplica' },
];

const CUERPOS_NO_SESIONAN = [
  'Comisión de Selección',
  'Comité Coordinador',
  'Comité Rector del Sistema de Fiscalización',
  'Comisión Ejecutiva',
  'Comité de Participación Ciudadana',
];

export function BloqueE({ data, onChange, readOnly, tieneCRSF = true, tieneCS = true, ccAplica = null, crsfAplica = null }: Props) {
  const set = (patch: Partial<BloqueEData>) => !readOnly && onChange?.(patch);
  const organos = ORGANOS.filter(org => {
    if (org.key === 'cc')   return ccAplica === true;
    if (org.key === 'crsf') return crsfAplica === true;
    return true;
  });
  const cuerposNoSesionan = CUERPOS_NO_SESIONAN.filter(c =>
    (c !== 'Comité Rector del Sistema de Fiscalización' || tieneCRSF) &&
    (c !== 'Comisión de Selección' || tieneCS)
  );

  const toggleCuerpo = (cuerpo: string) => {
    if (readOnly) return;
    const actual = data.cuerpos_no_sesionan;
    set({
      cuerpos_no_sesionan: actual.includes(cuerpo)
        ? actual.filter(c => c !== cuerpo)
        : [...actual, cuerpo],
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Registre el tiempo transcurrido desde la última sesión celebrada y el número de sesiones ordinarias programadas para 2026 de cada órgano.
      </p>

      {organos.map(org => (
        <div key={org.key} className="card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">{org.label}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              label="Tiempo desde la última sesión celebrada"
              value={data[`ult_sesion_${org.key}` as keyof BloqueEData] as string}
              onChange={e => set({ [`ult_sesion_${org.key}`]: e.target.value } as Partial<BloqueEData>)}
              required
              disabled={readOnly}
              options={SESION_OPTIONS}
              placeholder="Seleccione..."
            />
            <NumberInput
              label="Sesiones ordinarias programadas para 2026"
              value={data[`sesiones_prog_${org.key}_2026` as keyof BloqueEData] as number | ''}
              onChange={v => set({ [`sesiones_prog_${org.key}_2026`]: v } as Partial<BloqueEData>)}
              required
              disabled={readOnly}
              min={0}
            />
          </div>
        </div>
      ))}

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Suficiencia para sesionar</h3>
        <div className="space-y-5">
          <Toggle
            label="¿Todos los cuerpos colegiados cuentan con el número de integrantes suficientes para sesionar?"
            value={data.integrantes_suficientes}
            onChange={v => set(v ? { integrantes_suficientes: true, cuerpos_no_sesionan: [] } : { integrantes_suficientes: false })}
            required
            disabled={readOnly}
          />
          {data.integrantes_suficientes === false && (
          <div className="flex flex-col gap-2">
            <span className="field-label field-required">¿Qué cuerpos colegiados tienen una integración que les impide sesionar?</span>
            <div className="flex flex-col gap-2">
              {cuerposNoSesionan.map(cuerpo => {
                const checked = data.cuerpos_no_sesionan.includes(cuerpo);
                return (
                  <button
                    key={cuerpo}
                    type="button"
                    disabled={readOnly}
                    onClick={() => toggleCuerpo(cuerpo)}
                    className={`flex items-center gap-2.5 text-left text-sm rounded-lg border px-3 py-2 transition-colors ${
                      checked
                        ? 'border-guinda-700 bg-guinda-50 text-guinda-950'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-guinda-700'
                    } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center text-[10px] font-bold ${
                      checked ? 'bg-guinda-950 border-guinda-950 text-white' : 'border-gray-400 text-transparent'
                    }`}>
                      ✓
                    </span>
                    {cuerpo}
                  </button>
                );
              })}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
