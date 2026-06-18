import { ORGANOS, type EstructuraEstado } from '../../data/estructura';
import { TextInput } from '../ui/Input';
import type { BloqueBData, DesignacionSeat, OrganoKey } from '../../types';

interface Props {
  data: BloqueBData;
  estructura: EstructuraEstado;
  onChange?: (patch: Partial<BloqueBData>) => void;
  readOnly?: boolean;
}

const VACIO: DesignacionSeat = {
  vigente: null,
  fecha_designacion: '',
  fecha_termino: '',
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  cargo: '',
  institucion: '',
  telefono: '',
  correo: '',
};

// Reconstruye el arreglo de designaciones de un órgano con la longitud que marca
// la estructura (por ley), conservando lo capturado donde exista.
function seatsFor(data: BloqueBData, key: OrganoKey, n: number): DesignacionSeat[] {
  const actuales = data.designaciones?.[key] ?? [];
  return Array.from({ length: n }, (_, i) => actuales[i] ?? VACIO);
}

export function BloqueB({ data, estructura, onChange, readOnly }: Props) {
  const organos = ORGANOS.filter(org => estructura[org.key] > 0);

  const setSeat = (key: OrganoKey, index: number, patch: Partial<DesignacionSeat>) => {
    if (readOnly) return;
    const n = estructura[key];
    const seats = seatsFor(data, key, n).map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange?.({ designaciones: { ...data.designaciones, [key]: seats } });
  };

  if (organos.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Esta entidad aún no tiene una estructura registrada. Solicite al administrador la captura de la estructura SEA.
      </p>
    );
  }

  const resumen = organos.map(org => {
    const n = estructura[org.key];
    const seats = seatsFor(data, org.key, n);
    const vigentes = seats.filter(s => s.vigente === true).length;
    return { org, n, seats, vigentes, pendientes: n - vigentes };
  });
  const totalN = resumen.reduce((acc, r) => acc + r.n, 0);
  const totalVigentes = resumen.reduce((acc, r) => acc + r.vigentes, 0);
  const totalPendientes = totalN - totalVigentes;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Confirme la vigencia de cada designación.
      </p>

      {/* Resumen en tiempo real de todas las designaciones */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Resumen de designaciones</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-100">
              <th className="text-left font-medium py-1.5">Órgano</th>
              <th className="text-right font-medium py-1.5 w-24">Vigentes</th>
              <th className="text-right font-medium py-1.5 w-24">Pendientes</th>
              <th className="text-right font-medium py-1.5 w-20">Por ley</th>
            </tr>
          </thead>
          <tbody>
            {resumen.map(({ org, n, vigentes, pendientes }) => (
              <tr key={org.key} className="border-b border-gray-50">
                <td className="py-1.5">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-guinda-50 text-guinda-950 border border-guinda-100">{org.siglas}</span>
                    <span className="text-gray-700">{org.label}</span>
                  </span>
                </td>
                <td className="text-right tabular-nums text-gray-900">{vigentes}</td>
                <td className={`text-right tabular-nums font-medium ${pendientes > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{pendientes}</td>
                <td className="text-right tabular-nums text-gray-500">{n}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold text-gray-900">
              <td className="py-2">Total</td>
              <td className="text-right tabular-nums">{totalVigentes}</td>
              <td className={`text-right tabular-nums ${totalPendientes > 0 ? 'text-amber-600' : ''}`}>{totalPendientes}</td>
              <td className="text-right tabular-nums">{totalN}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {resumen.map(({ org, n, seats }) => {
        const numerar = n > 1;

        return (
          <div key={org.key} className="card p-5">
            <div className="flex items-start gap-3 mb-4">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-guinda-50 text-guinda-950 border border-guinda-100">
                {org.siglas}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{org.label}</p>
                <p className="text-xs text-gray-500">{n} {n === 1 ? 'designación contemplada por ley' : 'designaciones contempladas por ley'}</p>
              </div>
            </div>

            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {seats.map((seat, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-4 gap-y-2 md:items-start py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-28 shrink-0 field-required">
                      {numerar ? `Designación ${i + 1}` : 'Designación'}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => setSeat(org.key, i, { vigente: true })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          seat.vigente === true
                            ? 'bg-guinda-950 text-white border-guinda-950'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-guinda-700'
                        } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => setSeat(org.key, i, { ...VACIO, vigente: false })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          seat.vigente === false
                            ? 'bg-gray-700 text-white border-gray-700'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                        } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                  {seat.vigente === true ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextInput
                        label="Fecha de designación"
                        required
                        type="date"
                        value={seat.fecha_designacion}
                        readOnly={readOnly}
                        onChange={e => setSeat(org.key, i, { fecha_designacion: e.target.value })}
                      />
                      <TextInput
                        label="Fecha de término"
                        required
                        type="date"
                        value={seat.fecha_termino}
                        readOnly={readOnly}
                        min={seat.fecha_designacion || undefined}
                        onChange={e => setSeat(org.key, i, { fecha_termino: e.target.value })}
                      />
                      <TextInput
                        label="Nombre"
                        required
                        value={seat.nombre}
                        readOnly={readOnly}
                        onChange={e => setSeat(org.key, i, { nombre: e.target.value })}
                      />
                      <TextInput
                        label="Apellido paterno"
                        required
                        value={seat.apellido_paterno}
                        readOnly={readOnly}
                        onChange={e => setSeat(org.key, i, { apellido_paterno: e.target.value })}
                      />
                      <TextInput
                        label="Apellido materno"
                        required
                        value={seat.apellido_materno}
                        readOnly={readOnly}
                        onChange={e => setSeat(org.key, i, { apellido_materno: e.target.value })}
                      />
                      <TextInput
                        label="Cargo"
                        required
                        value={seat.cargo}
                        readOnly={readOnly}
                        onChange={e => setSeat(org.key, i, { cargo: e.target.value })}
                      />
                      <TextInput
                        label="Institución"
                        required
                        value={seat.institucion}
                        readOnly={readOnly}
                        onChange={e => setSeat(org.key, i, { institucion: e.target.value })}
                      />
                      <TextInput
                        label="Teléfono"
                        type="number"
                        value={seat.telefono}
                        readOnly={readOnly}
                        onChange={e => setSeat(org.key, i, { telefono: e.target.value })}
                      />
                      <TextInput
                        label="Correo electrónico"
                        required
                        type="email"
                        value={seat.correo}
                        readOnly={readOnly}
                        onChange={e => setSeat(org.key, i, { correo: e.target.value })}
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">
                      {seat.vigente === false ? 'Designación pendiente' : 'Confirme la vigencia'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
