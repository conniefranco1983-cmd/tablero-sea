import { MoneyInput } from '../ui/MoneyInput';
import { NumberInput, TextInput } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import { MAX } from '../../lib/fieldLimits';
import type { BloqueFData } from '../../types';

interface Props {
  data: BloqueFData;
  onChange?: (patch: Partial<BloqueFData>) => void;
  errors?: Partial<Record<string, string>>;
  readOnly?: boolean;
}

const CAPITULOS = [
  { key: 'cap_1000', label: '1000: Servicios Personales' },
  { key: 'cap_2000', label: '2000: Materiales y Suministros' },
  { key: 'cap_3000', label: '3000: Servicios Generales' },
  { key: 'cap_4000', label: '4000: Transferencias, Asignaciones y Subsidios' },
  { key: 'cap_5000', label: '5000: Bienes Muebles, Inmuebles e Intangibles' },
  { key: 'cap_6000', label: '6000: Inversión Pública' },
  { key: 'cap_7000', label: '7000: Inversiones Financieras y Otras' },
  { key: 'cap_8000', label: '8000: Participaciones y Aportaciones' },
  { key: 'cap_9000', label: '9000: Deuda Pública' },
] as const;

function sumaCapitulos(data: BloqueFData): number {
  return CAPITULOS.reduce((acc, c) => acc + (Number(data[c.key]) || 0), 0);
}

export function BloqueF({ data, onChange, errors = {}, readOnly }: Props) {
  const set = (patch: Partial<BloqueFData>) => !readOnly && onChange?.(patch);

  const suma = sumaCapitulos(data);
  const total2026 = Number(data.presupuesto_2026) || 0;
  const diffCapitulos = total2026 > 0 ? Math.abs(suma - total2026) : null;
  const capitulosValidos = diffCapitulos === null || diffCapitulos <= 1;

  return (
    <div className="space-y-8">
      {/* Presupuesto histórico SESEA */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Presupuesto asignado a la SESEA por ejercicio fiscal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <MoneyInput label="Presupuesto 2023" value={data.presupuesto_2023} onChange={v => set({ presupuesto_2023: v })} required readOnly={readOnly} />
          <MoneyInput label="Presupuesto 2024" value={data.presupuesto_2024} onChange={v => set({ presupuesto_2024: v })} required readOnly={readOnly} />
          <MoneyInput label="Presupuesto 2025" value={data.presupuesto_2025} onChange={v => set({ presupuesto_2025: v })} required readOnly={readOnly} />
          <MoneyInput label="Presupuesto 2026" value={data.presupuesto_2026} onChange={v => set({ presupuesto_2026: v })} required readOnly={readOnly} />
        </div>
      </div>

      {/* Desglose por capítulos */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Desglose del presupuesto asignado 2026 por capítulo</h3>
        <p className="text-xs text-gray-500 mb-4">
          La suma de los capítulos debe coincidir con el Presupuesto SESEA 2026.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CAPITULOS.map(c => (
            <MoneyInput
              key={c.key}
              label={c.label}
              value={data[c.key]}
              onChange={v => set({ [c.key]: v } as Partial<BloqueFData>)}
              required
              readOnly={readOnly}
              error={errors['bloque_f.capitulos'] && !capitulosValidos && data[c.key] !== '' ? undefined : undefined}
            />
          ))}
        </div>

        {/* Totalizador */}
        <div className={`mt-4 rounded-lg px-4 py-3 flex items-center justify-between ${
          total2026 <= 0 ? 'bg-gray-50 border border-gray-200' :
          capitulosValidos ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <span className="text-sm font-medium text-gray-700">Suma de capítulos</span>
          <div className="text-right">
            <span className={`text-sm font-semibold ${
              total2026 <= 0 ? 'text-gray-700' : capitulosValidos ? 'text-green-700' : 'text-red-700'
            }`}>
              ${suma.toLocaleString('es-MX')} MXN
            </span>
            {total2026 > 0 && (
              <p className="text-xs text-gray-500">Total 2026: ${total2026.toLocaleString('es-MX')} MXN</p>
            )}
          </div>
        </div>

        {errors['bloque_f.capitulos'] && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{errors['bloque_f.capitulos']}</p>
          </div>
        )}
      </div>

      {/* Presupuesto CPC */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Presupuesto del CPC 2026</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <MoneyInput label="Presupuesto CPC 2026" value={data.presupuesto_cpc_2026} onChange={v => set({ presupuesto_cpc_2026: v })} required readOnly={readOnly} />
          <NumberInput
            label="N.º de contratos vigentes del CPC 2026"
            value={data.contratos_vig_cpc_2026}
            onChange={v => set({ contratos_vig_cpc_2026: v })}
            disabled={readOnly}
            min={0}
            required
          />
          <Toggle
            label="¿Los honorarios del presidente del CPC son distintos a los de los demás integrantes?"
            value={data.honorarios_pdte_distintos}
            onChange={v => set({ honorarios_pdte_distintos: v })}
            disabled={readOnly}
            required
          />
          <TextInput
            label="Partida presupuestal de los honorarios del CPC"
            value={data.partida_honorarios_cpc}
            onChange={e => set({ partida_honorarios_cpc: e.target.value })}
            readOnly={readOnly}
            placeholder="Ej. 3000"
            maxLength={MAX.nombre}
          />
        </div>
      </div>
    </div>
  );
}
