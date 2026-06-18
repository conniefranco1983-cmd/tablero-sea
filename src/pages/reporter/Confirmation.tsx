import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, Calendar } from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../contexts/AppContext';
import { useReport } from '../../hooks/useReports';
import { useActivePeriodo } from '../../hooks/usePeriodos';
import { getEstado } from '../../data/estados';

function formatFull(iso: string | null): string {
  if (!iso) return new Date().toLocaleString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return new Date(iso).toLocaleString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function Confirmation() {
  const { user } = useApp();
  const { data: activePeriodo } = useActivePeriodo();
  const { data: report } = useReport(user?.estadoId, activePeriodo?.id);
  const navigate = useNavigate();
  const estado = user?.estadoId ? getEstado(user.estadoId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-16 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reporte enviado exitosamente</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          El reporte trimestral de <strong>{estado?.nombre}</strong> correspondiente al <strong>{activePeriodo?.label}</strong> fue recibido correctamente.
        </p>

        <div className="w-full card p-6 text-left space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-guinda-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Fecha y hora de envío</p>
              <p className="text-sm font-medium text-gray-800 capitalize">{formatFull(report?.fecha_envio ?? null)}</p>
            </div>
          </div>
        </div>

        <div className="w-full rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-left mb-8">
          <p className="text-sm font-semibold text-green-800 mb-1">Recepción confirmada</p>
          <p className="text-sm text-green-700">
            La recepción del reporte final queda asociada a la fecha, hora y correo registrados en esta pantalla.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="primary" icon={<Home size={15} />} onClick={() => navigate('/reporter/tablero')}>
            Volver al inicio
          </Button>
        </div>
      </main>
    </div>
  );
}
