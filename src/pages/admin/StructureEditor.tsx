import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader';
import { ConfirmModal } from '../../components/ui/Modal';
import { useEstructura, useUpdateEstructura } from '../../hooks/useEstructura';
import { useEstados } from '../../hooks/useEstados';
import { Loading, LoadError } from '../../components/ui/AsyncStates';
import { ORGANOS, getEstructura } from '../../data/estructura';
import type { OrganoKey } from '../../types';

interface PendingChange {
  estadoId: string;
  estadoNombre: string;
  organo: OrganoKey;
  organoSiglas: string;
  from: number;
  value: number;
}

export function StructureEditor() {
  const { data: estructura, isLoading, isError, refetch } = useEstructura();
  const { data: estados, isLoading: estadosLoading } = useEstados();
  const updateMut = useUpdateEstructura();
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingChange | null>(null);
  // Valores en edición por celda (`estadoId:organo`): permiten teclear libremente
  // sin disparar una escritura ni el modal de reducción en cada pulsación; el
  // cambio se confirma al salir del campo (blur) o con Enter.
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (isLoading || estadosLoading || !estructura || !estados) return <Loading label="Cargando estructura…" />;
  if (isError) return <LoadError onRetry={() => refetch()} />;

  const keyFor = (estadoId: string, organo: OrganoKey) => `${estadoId}:${organo}`;
  const clearDraft = (estadoId: string, organo: OrganoKey) =>
    setDrafts(prev => {
      const k = keyFor(estadoId, organo);
      if (!(k in prev)) return prev;
      const rest = { ...prev };
      delete rest[k];
      return rest;
    });

  const applyChange = (estadoId: string, organo: OrganoKey, value: number) => {
    // Al asentar la escritura, descartar el borrador para que el campo muestre el
    // valor del servidor (o lo revierta si la escritura falla).
    updateMut.mutate({ estadoId, organo, value }, { onSettled: () => clearDraft(estadoId, organo) });
  };

  // Confirma el valor de una celda. Bajar el número de designaciones deja
  // inaccesibles las plazas ya capturadas por encima del nuevo tope (los datos no
  // se borran, pero el formulario deja de mostrarlas): se pide confirmación.
  const commit = (estadoId: string, estadoNombre: string, org: { key: OrganoKey; siglas: string }, raw: string) => {
    const num = Number(raw);
    const from = getEstructura(estructura, estadoId)[org.key];
    if (raw !== '' && Number.isNaN(num)) { clearDraft(estadoId, org.key); return; }
    const value = raw === '' ? 0 : Math.max(0, Math.floor(num));
    if (value === from) { clearDraft(estadoId, org.key); return; }
    if (value < from) {
      // Mantener el borrador visible mientras el modal está abierto.
      setPending({ estadoId, estadoNombre, organo: org.key, organoSiglas: org.siglas, from, value });
      return;
    }
    applyChange(estadoId, org.key, value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/admin/tablero')} className="flex items-center gap-1 hover:text-guinda-950">
            <Home size={14} />Tablero
          </button>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-700">Editar estructura SEA</span>
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-900">Editar estructura SEA</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Número de designaciones contempladas por ley por entidad y órgano. Un valor de 0 indica que
            el órgano no aplica para la entidad.
          </p>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Entidad</th>
                  {ORGANOS.map(org => (
                    <th key={org.key} className="px-3 py-3 text-xs font-semibold text-gray-600 text-center" title={org.label}>
                      {org.siglas}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {estados.map(estado => {
                  const est = getEstructura(estructura, estado.id);
                  return (
                    <tr key={estado.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{estado.nombre}</td>
                      {ORGANOS.map(org => {
                        const k = keyFor(estado.id, org.key);
                        const value = drafts[k] ?? String(est[org.key]);
                        return (
                          <td key={org.key} className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={0}
                              value={value}
                              onChange={e => setDrafts(prev => ({ ...prev, [k]: e.target.value }))}
                              onBlur={e => commit(estado.id, estado.nombre, org, e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                              className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-guinda-700 focus:ring-1 focus:ring-guinda-700"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ConfirmModal
        open={!!pending}
        onClose={() => {
          // Cancelar: revertir el borrador al valor del servidor.
          if (pending) clearDraft(pending.estadoId, pending.organo);
          setPending(null);
        }}
        onConfirm={() => {
          if (pending) applyChange(pending.estadoId, pending.organo, pending.value);
          setPending(null);
        }}
        title="Reducir designaciones"
        confirmLabel="Reducir"
        confirmVariant="danger"
        message={
          pending
            ? `Va a reducir ${pending.organoSiglas} de ${pending.estadoNombre} de ${pending.from} a ${pending.value}. ` +
              `Las designaciones ya capturadas por encima de ${pending.value} dejarán de mostrarse en el formulario. ¿Continuar?`
            : ''
        }
      />
    </div>
  );
}
