import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, ReceiptText, FileEdit, Circle, Calendar, Download } from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader';
import { StatusBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { useReports, useLatestReportedPeriodo } from '../../hooks/useReports';
import { usePeriodos } from '../../hooks/usePeriodos';
import { useEstructura } from '../../hooks/useEstructura';
import { buildBaseCsv, buildDesignacionesCsv, downloadCsv } from '../../lib/exportCsv';
import { useEstados } from '../../hooks/useEstados';
import { Loading, LoadError } from '../../components/ui/AsyncStates';
import type { ReportStatus, MockReport } from '../../types';

type SortKey = 'nombre' | 'progreso' | 'status' | 'fecha';
type SortDir = 'asc' | 'desc';

function formatDate(iso: string | null): string {
  if (!iso) return 'Sin fecha';
  return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_FILTER_OPTIONS: { value: ReportStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'enviado', label: 'Enviados' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'sin_iniciar', label: 'Sin iniciar' },
];

const STATUS_ORDER: Record<ReportStatus, number> = { enviado: 0, borrador: 1, sin_iniciar: 2 };

function SortIcon({ k, sortKey, sortDir }: { k: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== k) return <ChevronUp size={12} className="text-gray-300" />;
  return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
}

export function NationalDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: periodos, isLoading: periodosLoading } = usePeriodos();
  const { data: defaultPeriodoId, isLoading: defaultLoading } = useLatestReportedPeriodo();
  // El admin ve cualquier período (no el activo): la URL manda; por defecto, el
  // más reciente con reportes.
  const periodoId = searchParams.get('periodo') ?? defaultPeriodoId ?? undefined;
  const { data: estados, isLoading: estadosLoading } = useEstados();
  const { data: estructura } = useEstructura();
  const { data: reports, isLoading: reportsLoading, isError, refetch } = useReports(periodoId);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'todos'>('todos');
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const rows = useMemo(() => {
    const estadoList = estados ?? [];
    const reportList = reports ?? [];
    return estadoList.map(e => {
      const r = reportList.find(r => r.estadoId === e.id);
      return { estado: e, report: r as MockReport | undefined };
    })
    .filter(({ estado, report }) => {
      const matchSearch = estado.nombre.toLowerCase().includes(search.toLowerCase()) || estado.abrev.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'todos' || (report?.status ?? 'sin_iniciar') === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let cmp = 0;
      const aStatus = a.report?.status ?? 'sin_iniciar';
      const bStatus = b.report?.status ?? 'sin_iniciar';
      if (sortKey === 'nombre')   cmp = a.estado.nombre.localeCompare(b.estado.nombre);
      if (sortKey === 'progreso') cmp = (a.report?.progreso ?? 0) - (b.report?.progreso ?? 0);
      if (sortKey === 'status')   cmp = STATUS_ORDER[aStatus] - STATUS_ORDER[bStatus];
      if (sortKey === 'fecha')    cmp = (a.report?.ultimo_guardado ?? '').localeCompare(b.report?.ultimo_guardado ?? '');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [estados, reports, search, statusFilter, sortKey, sortDir]);

  const counts = useMemo(() => {
    const estadoList = estados ?? [];
    const reportList = reports ?? [];
    return {
      enviado:  reportList.filter(r => r.status === 'enviado').length,
      borrador: reportList.filter(r => r.status === 'borrador').length,
      sin_iniciar: estadoList.length - reportList.filter(r => r.status !== 'sin_iniciar').length,
    };
  }, [estados, reports]);

  if (estadosLoading || periodosLoading || defaultLoading || !periodoId) return <Loading label="Cargando tablero nacional…" />;
  if (reportsLoading) return <Loading label="Cargando tablero nacional…" />;
  if (isError) return <LoadError onRetry={() => refetch()} />;

  const estadoList = estados ?? [];
  const reportList = reports ?? [];
  const canExport = reportList.length > 0 && !!estados;

  const exportDesignaciones = () =>
    downloadCsv(`designaciones_${periodoId}.csv`, buildDesignacionesCsv(reportList, estados!));
  const exportBase = () =>
    estructura && downloadCsv(`tablero_${periodoId}.csv`, buildBaseCsv(reportList, estados!, estructura));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tablero nacional</h1>
            <p className="text-sm text-gray-500 mt-0.5">Envío final de {estadoList.length} entidades federativas</p>
            <div className="mt-2 flex items-center gap-2">
              <label htmlFor="periodo-select" className="text-xs font-medium text-gray-600">Período:</label>
              <select
                id="periodo-select"
                value={periodoId}
                onChange={e => setSearchParams({ periodo: e.target.value })}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-guinda-700 focus:ring-1 focus:ring-guinda-700"
              >
                {(periodos ?? []).map(p => (
                  <option key={p.id} value={p.id}>{p.label}{p.activo ? ' (activo)' : ''}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button variant="secondary" size="sm" icon={<Calendar size={14} />} onClick={() => navigate('/admin/periodos')}>
              Períodos
            </Button>
            <Button variant="secondary" size="sm" icon={<FileEdit size={14} />} onClick={() => navigate('/admin/estructura')}>
              Editar estructura SEA
            </Button>
            <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={exportDesignaciones} disabled={!canExport}>
              Exportar designaciones
            </Button>
            <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={exportBase} disabled={!canExport || !estructura}>
              Exportar tablero (base)
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Enviados', value: counts.enviado, icon: ReceiptText, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
            { label: 'Borrador',    value: counts.borrador,    icon: FileEdit,     color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-100' },
            { label: 'Sin iniciar', value: counts.sin_iniciar, icon: Circle,       color: 'text-gray-500',  bg: 'bg-gray-50 border-gray-100' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`card p-4 border ${bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={color} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">de {estadoList.length} entidades</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar entidad..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-guinda-700 focus:ring-1 focus:ring-guinda-700"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value as ReportStatus | 'todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-guinda-950 text-white border-guinda-950'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-guinda-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => handleSort('nombre')} className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900">
                      Entidad <SortIcon k="nombre" sortKey={sortKey} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => handleSort('status')} className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900">
                      Estado <SortIcon k="status" sortKey={sortKey} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 w-40">
                    <button onClick={() => handleSort('progreso')} className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900">
                      Avance <SortIcon k="progreso" sortKey={sortKey} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">
                    <button onClick={() => handleSort('fecha')} className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900">
                      Último guardado <SortIcon k="fecha" sortKey={sortKey} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs font-semibold text-gray-600">Fecha envío</span>
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                      No se encontraron entidades con los filtros seleccionados.
                    </td>
                  </tr>
                ) : rows.map(({ estado, report }) => (
                  <tr key={estado.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{estado.nombre}</p>
                      <p className="text-xs text-gray-400">{estado.titular}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={report?.status ?? 'sin_iniciar'} />
                    </td>
                    <td className="px-4 py-3 w-40">
                      <ProgressBar value={report?.progreso ?? 0} size="sm" />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">
                      {formatDate(report?.ultimo_guardado ?? null)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">
                      {formatDate(report?.fecha_envio ?? null)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {report && report.status !== 'sin_iniciar' && (
                        <button
                          onClick={() => navigate(`/admin/reporte/${estado.id}/${periodoId}`)}
                          className="text-xs font-medium text-guinda-950 hover:underline"
                        >
                          Ver reporte
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Mostrando {rows.length} de {estadoList.length} entidades</p>
          </div>
        </div>
      </main>
    </div>
  );
}
