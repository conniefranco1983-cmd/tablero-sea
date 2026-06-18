import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Lock, Unlock, ChevronRight, Home, Trash2, RotateCcw } from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader';
import { Button } from '../../components/ui/Button';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { useApp } from '../../contexts/AppContext';
import {
  usePeriodos,
  useArchivedPeriodos,
  useCreatePeriodo,
  useSetActivePeriodo,
  useDeletePeriodo,
  useRestorePeriodo,
} from '../../hooks/usePeriodos';
import { Loading, LoadError } from '../../components/ui/AsyncStates';
import type { Periodo } from '../../types';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function isOpen(p: Periodo): boolean {
  const now = new Date();
  return new Date(p.fecha_apertura) <= now && new Date(p.fecha_cierre) >= now;
}

export function PeriodManagement() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { data: periodos, isLoading, isError, refetch } = usePeriodos();
  const { data: archivados } = useArchivedPeriodos();
  const createMut = useCreatePeriodo();
  const setActiveMut = useSetActivePeriodo();
  const deleteMut = useDeletePeriodo();
  const restoreMut = useRestorePeriodo();
  const [pendingDelete, setPendingDelete] = useState<Periodo | null>(null);
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState<'trimestral' | 'mensual'>('trimestral');
  const [nuevoTrimestre, setNuevoTrimestre] = useState('2');
  const [nuevoMes, setNuevoMes] = useState('1');
  const [nuevoAnio, setNuevoAnio] = useState('2026');
  const [creating, setCreating] = useState(false);

  const handleCrear = async () => {
    setCreating(true);
    const anio = Number(nuevoAnio);
    const existentes = periodos ?? [];

    let newPeriodo: Periodo;
    if (nuevoTipo === 'mensual') {
      const mes = Number(nuevoMes);
      const id = `${anio}-M${String(mes).padStart(2, '0')}`;
      if (existentes.some(p => p.id === id)) {
        addToast({ type: 'error', message: 'Ya existe un período con ese mes y año.' });
        setCreating(false);
        return;
      }
      const cierreAnio = mes === 12 ? anio + 1 : anio;
      const cierreMes  = mes === 12 ? 1 : mes + 1;
      newPeriodo = {
        id,
        label: `${MESES[mes - 1]} ${anio}`,
        tipo: 'mensual',
        mes,
        anio,
        fecha_apertura: `${anio}-${String(mes).padStart(2, '0')}-15`,
        fecha_cierre:   `${cierreAnio}-${String(cierreMes).padStart(2, '0')}-14`,
        activo: false,
      };
    } else {
      const trim = Number(nuevoTrimestre);
      const labels: Record<number, string> = { 1: 'Primer', 2: 'Segundo', 3: 'Tercer', 4: 'Cuarto' };
      const id = `${anio}-Q${trim}`;
      if (existentes.some(p => p.id === id)) {
        addToast({ type: 'error', message: 'Ya existe un período con ese trimestre y año.' });
        setCreating(false);
        return;
      }
      const cierreAnio  = trim === 4 ? anio + 1 : anio;
      const mesCierre   = trim === 4 ? 1 : trim * 3 + 1;
      // El trimestre es una ranura mensual renombrada: ventana de un mes que
      // cierra en su mes de reporte (Q1→abril, Q4→enero), no un lapso de 3 meses.
      const aperturaAnio = mesCierre === 1 ? cierreAnio - 1 : cierreAnio;
      const aperturaMes  = mesCierre === 1 ? 12 : mesCierre - 1;
      newPeriodo = {
        id,
        label: `${labels[trim]} Trimestre ${anio}`,
        tipo: 'trimestral',
        trimestre: trim,
        anio,
        fecha_apertura: `${aperturaAnio}-${String(aperturaMes).padStart(2,'0')}-15`,
        fecha_cierre:   `${cierreAnio}-${String(mesCierre).padStart(2,'0')}-14`,
        activo: false,
      };
    }
    await createMut.mutateAsync(newPeriodo);
    addToast({ type: 'success', message: `Período ${newPeriodo.label} creado.` });
    setCreating(false);
    setNuevoOpen(false);
  };

  const toggleActivo = (id: string) => {
    const target = (periodos ?? []).find(x => x.id === id)!;
    // Solo puede haber un período activo a la vez. Activar marca este id y
    // desactiva los demás; "cerrar" el activo pasa un id inexistente ('') para
    // dejar todos inactivos. (El comportamiento de cierre se amplía en el Paso 7.)
    setActiveMut.mutate(target.activo ? '' : id);
    addToast({ type: 'success', message: `Período ${target.label} ${target.activo ? 'cerrado' : 'abierto'}.` });
  };

  const handleEliminar = () => {
    if (!pendingDelete) return;
    const p = pendingDelete;
    deleteMut.mutate(p.id, {
      onSuccess: () => addToast({ type: 'success', message: `Período ${p.label} eliminado del tablero.` }),
      onError: () => addToast({ type: 'error', message: 'No se pudo eliminar el período.' }),
    });
    setPendingDelete(null);
  };

  const handleRestaurar = (p: Periodo) => {
    restoreMut.mutate(p.id, {
      onSuccess: () => addToast({ type: 'success', message: `Período ${p.label} restaurado.` }),
      onError: () => addToast({ type: 'error', message: 'No se pudo restaurar el período.' }),
    });
  };

  if (isLoading || !periodos) return <Loading label="Cargando períodos…" />;
  if (isError) return <LoadError onRetry={() => refetch()} />;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/admin/tablero')} className="flex items-center gap-1 hover:text-guinda-950">
            <Home size={14} />Tablero
          </button>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-700">Gestión de períodos</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Gestión de períodos de captura</h1>
            <p className="text-sm text-gray-500 mt-0.5">Administre los períodos mensuales y trimestrales disponibles para captura.</p>
          </div>
          <Button variant="primary" icon={<Plus size={15} />} onClick={() => setNuevoOpen(true)}>
            Nuevo período
          </Button>
        </div>

        {/* Lista de períodos */}
        <div className="card divide-y divide-gray-100">
          {periodos.map(periodo => {
            const abierto = isOpen(periodo);
            return (
              <div key={periodo.id} className="px-5 py-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  periodo.activo ? 'bg-guinda-50 text-guinda-950' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Calendar size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{periodo.label}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                      {periodo.tipo}
                    </span>
                    {periodo.activo && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Activo
                      </span>
                    )}
                    {abierto && !periodo.activo && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                        En fecha
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Apertura: {formatDate(periodo.fecha_apertura)}. Cierre: {formatDate(periodo.fecha_cierre)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{periodo.id}</span>
                  <button
                    onClick={() => toggleActivo(periodo.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      periodo.activo
                        ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        : 'border-guinda-200 text-guinda-950 hover:bg-guinda-50'
                    }`}
                  >
                    {periodo.activo ? <><Lock size={12} />Cerrar</> : <><Unlock size={12} />Abrir</>}
                  </button>
                  {/* No se puede eliminar el período activo: hay que cerrarlo antes. */}
                  {!periodo.activo && (
                    <button
                      onClick={() => setPendingDelete(periodo)}
                      title="Eliminar período"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} />Eliminar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Períodos eliminados (archivados): los datos se conservan; restaurar reacopla. */}
        {archivados && archivados.length > 0 && (
          <div className="card">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Períodos eliminados</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Ocultos del tablero y del selector. Sus reportes se conservan; al restaurar se reacoplan.
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {archivados.map(p => (
                <div key={p.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gray-100 text-gray-400">
                    <Calendar size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">{p.label}</p>
                    <p className="text-xs text-gray-400">{p.id}</p>
                  </div>
                  <button
                    onClick={() => handleRestaurar(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-guinda-200 text-guinda-950 hover:bg-guinda-50 transition-colors"
                  >
                    <RotateCcw size={12} />Restaurar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card p-5 bg-blue-50 border-blue-100">
          <p className="text-xs text-blue-700">
            <strong>Nota:</strong> Solo puede haber un período activo a la vez. El período activo es el único disponible para captura en las entidades.
            Al cerrar un período sin abrir otro, la captura queda cerrada para todas las entidades; los reportes se conservan pero ya no pueden editarse.
          </p>
        </div>
      </main>

      {/* Modal nuevo período */}
      <Modal
        open={nuevoOpen}
        onClose={() => setNuevoOpen(false)}
        title="Crear nuevo período de reporte"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNuevoOpen(false)} disabled={creating}>Cancelar</Button>
            <Button variant="primary" onClick={handleCrear} loading={creating}>Crear período</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="field-label field-required">Tipo de período</label>
            <select
              value={nuevoTipo}
              onChange={e => setNuevoTipo(e.target.value as 'trimestral' | 'mensual')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-guinda-700"
            >
              <option value="trimestral">Trimestral</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
          {nuevoTipo === 'trimestral' ? (
            <div>
              <label className="field-label field-required">Trimestre</label>
              <select
                value={nuevoTrimestre}
                onChange={e => setNuevoTrimestre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-guinda-700"
              >
                <option value="1">Primer Trimestre</option>
                <option value="2">Segundo Trimestre</option>
                <option value="3">Tercer Trimestre</option>
                <option value="4">Cuarto Trimestre</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="field-label field-required">Mes</label>
              <select
                value={nuevoMes}
                onChange={e => setNuevoMes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-guinda-700"
              >
                {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="field-label field-required">Año</label>
            <select
              value={nuevoAnio}
              onChange={e => setNuevoAnio(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-guinda-700"
            >
              {[2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleEliminar}
        title="Eliminar período"
        confirmLabel="Eliminar"
        confirmVariant="danger"
        message={
          pendingDelete
            ? `Se ocultará "${pendingDelete.label}" del tablero y del selector. Los reportes capturados NO se eliminan: ` +
              `se conservan y se reacoplan si vuelve a agregar o restaurar el período. ¿Continuar?`
            : ''
        }
      />
    </div>
  );
}
