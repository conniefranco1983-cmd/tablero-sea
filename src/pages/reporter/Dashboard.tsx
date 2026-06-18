import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, Send, FileEdit, AlertCircle, Eye } from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge, BloqueBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useApp } from '../../contexts/AppContext';
import { useReport } from '../../hooks/useReports';
import { useActivePeriodo } from '../../hooks/usePeriodos';
import { BLOQUES_REPORTERO } from '../../data/bloques';
import { getEstado } from '../../data/estados';
import { Loading } from '../../components/ui/AsyncStates';
import type { BloqueKey } from '../../types';

function formatDate(iso: string | null): string {
  if (!iso) return 'Sin fecha';
  return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ReporterDashboard() {
  const { user, setActiveBloque } = useApp();
  const { data: activePeriodo, isLoading: periodoLoading } = useActivePeriodo();
  const { data: report, isLoading } = useReport(user?.estadoId, activePeriodo?.id);
  const navigate = useNavigate();
  const estado = user?.estadoId ? getEstado(user.estadoId) : null;

  const handleContinuar = () => {
    setActiveBloque('A');
    navigate('/reporter/captura');
  };
  const handleIrBloque = (key: BloqueKey) => {
    setActiveBloque(key);
    navigate('/reporter/captura');
  };

  if (periodoLoading) return <Loading label="Cargando tablero…" />;

  // Sin período activo: la captura está cerrada para todas las entidades.
  if (!activePeriodo) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="card p-8 max-w-md text-center">
            <AlertCircle size={32} className="mx-auto text-gray-400" />
            <h1 className="text-lg font-bold text-gray-900 mt-3">No hay período de captura abierto</h1>
            <p className="text-sm text-gray-500 mt-2">
              Actualmente no hay un período activo. La captura estará disponible cuando se
              abra un nuevo período.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) return <Loading label="Cargando tablero…" />;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-8 space-y-6">
        {/* Bienvenida */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">{activePeriodo?.label}</p>
              <h1 className="text-xl font-bold text-gray-900">{estado?.nombre ?? 'Mi entidad'}</h1>
              <p className="text-sm text-gray-500 mt-1">{user?.nombre}</p>
              <div className="flex items-center gap-3 mt-3">
                {report && <StatusBadge status={report.status} />}
                {report?.ultimo_guardado && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    Guardado: {formatDate(report.ultimo_guardado)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {report?.status !== 'enviado' && (
                <Button variant="primary" size="lg" icon={<FileEdit size={16} />} onClick={handleContinuar}>
                  {report?.status === 'borrador' ? 'Continuar captura' : 'Iniciar captura'}
                </Button>
              )}
              {report?.status === 'enviado' && (
                <>
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <Send size={14} />
                    Reporte enviado correctamente
                  </div>
                  <Button variant="secondary" size="sm" icon={<Eye size={14} />} onClick={handleContinuar}>
                    Consultar reporte enviado
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Progreso */}
          {report && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Avance general del reporte</p>
                <span className="text-sm font-semibold text-gray-900">{report.progreso}%</span>
              </div>
              <ProgressBar value={report.progreso} showLabel={false} />
            </div>
          )}
        </div>

        {/* Estado por bloque */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Estado por sección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BLOQUES_REPORTERO.map(bloque => {
              const status = report?.bloqueStatuses[bloque.key] ?? 'no_iniciado';
              return (
                <button
                  key={bloque.key}
                  onClick={() => handleIrBloque(bloque.key as BloqueKey)}
                  className="card p-4 text-left flex items-center gap-4 transition-all hover:border-guinda-200 hover:shadow-md cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                    status === 'completo' ? 'bg-green-100 text-green-700' :
                    status === 'incompleto' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {bloque.key}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{bloque.titulo}</p>
                    <p className="text-xs text-gray-400 truncate">{bloque.descripcion}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <BloqueBadge status={status} />
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validaciones pendientes */}
        {report?.status === 'borrador' && report.progreso < 100 && (
          <div className="card p-5 border-amber-200 bg-amber-50/40">
            <div className="flex gap-3">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Captura incompleta</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Complete todas las secciones antes de enviar el reporte. Puede guardar borradores y continuar en cualquier momento.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button variant="primary" size="sm" onClick={handleContinuar}>Continuar captura</Button>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/reporter/revision')}>Ver revisión</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {report?.progreso === 100 && report.status === 'borrador' && (
          <div className="card p-5 bg-green-50 border-green-200">
            <div className="flex gap-3">
              <span className="text-green-600 text-lg shrink-0">✓</span>
              <div>
                <p className="text-sm font-semibold text-green-800">Captura completa</p>
                <p className="text-sm text-green-700 mt-0.5">Todas las secciones están completas. Revise el reporte antes de enviarlo.</p>
                <Button variant="primary" size="sm" className="mt-3" onClick={() => navigate('/reporter/revision')}>
                  Revisar y enviar
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
