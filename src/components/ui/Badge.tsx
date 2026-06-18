import type { ReportStatus, BloqueStatus } from '../../types';

const STATUS_CONFIG: Record<ReportStatus, { label: string; classes: string }> = {
  sin_iniciar: { label: 'Sin iniciar', classes: 'bg-gray-100 text-gray-600 border border-gray-200' },
  borrador:    { label: 'Borrador',    classes: 'bg-blue-50 text-blue-700 border border-blue-200' },
  enviado:     { label: 'Enviado', classes: 'bg-green-50 text-green-700 border border-green-200' },
};

const BLOQUE_CONFIG: Record<BloqueStatus, { label: string; classes: string; dot: string }> = {
  completo:    { label: 'Completo',    classes: 'text-green-700',  dot: 'bg-green-500' },
  incompleto:  { label: 'Incompleto',  classes: 'text-amber-700',  dot: 'bg-amber-400' },
  no_iniciado: { label: 'Sin iniciar', classes: 'text-gray-400',   dot: 'bg-gray-300' },
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

export function BloqueBadge({ status }: { status: BloqueStatus }) {
  const cfg = BLOQUE_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
