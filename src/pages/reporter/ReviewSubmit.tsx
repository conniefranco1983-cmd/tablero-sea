import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Edit, Send, Home, ChevronRight } from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader';
import { Button } from '../../components/ui/Button';
import { BloqueBadge } from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/Modal';
import { useApp } from '../../contexts/AppContext';
import { useEstructura } from '../../hooks/useEstructura';
import { useActivePeriodo } from '../../hooks/usePeriodos';
import { BLOQUES_REPORTERO } from '../../data/bloques';
import { getEstructura } from '../../data/estructura';
import { deriveStatuses } from '../../lib/completeness';
import { validarSumaCapitulos } from '../../lib/validation';
import { Loading } from '../../components/ui/AsyncStates';
import type { BloqueKey } from '../../types';

export function ReviewSubmit() {
  const { user, formData, setActiveBloque, submitReport } = useApp();
  const { data: estructura } = useEstructura();
  const { data: activePeriodo, isLoading: periodoLoading } = useActivePeriodo();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!periodoLoading && !activePeriodo) return <Navigate to="/reporter/tablero" replace />;

  if (!formData || !estructura) {
    return <Loading label="Cargando revisión…" />;
  }

  const est = getEstructura(estructura, user?.estadoId);
  const { bloqueStatuses } = deriveStatuses(formData, est);

  const allErrors = validarSumaCapitulos(formData.bloque_f);

  const incompletos = BLOQUES_REPORTERO.filter(b => {
    const s = bloqueStatuses[b.key];
    return s === 'incompleto' || s === 'no_iniciado';
  });

  const puedeEnviar = incompletos.length === 0 && allErrors.length === 0;

  const handleGoToBloque = (key: BloqueKey) => {
    setActiveBloque(key);
    navigate('/reporter/captura');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    const ok = await submitReport();
    setSubmitting(false);
    setConfirmOpen(false);
    if (ok) navigate('/reporter/confirmacion');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/reporter/tablero')} className="flex items-center gap-1 hover:text-guinda-950">
            <Home size={14} />Inicio
          </button>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-700">Revisión previa al envío</span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-6">Revisión previa al envío</h1>

        {/* Errores de validación cruzada */}
        {allErrors.length > 0 && (
          <div className="card p-5 border-red-200 bg-red-50 mb-5">
            <div className="flex gap-3">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Errores de validación que deben resolverse</p>
                <ul className="mt-2 space-y-1">
                  {allErrors.map((e, i) => (
                    <li key={i} className="text-sm text-red-700">• {e.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Secciones incompletas */}
        {incompletos.length > 0 && (
          <div className="card p-5 border-amber-200 bg-amber-50/40 mb-5">
            <div className="flex gap-3">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">Secciones incompletas</p>
                <ul className="mt-2 space-y-1.5">
                  {incompletos.map(b => (
                    <li key={b.key} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-700 w-5">{b.key}</span>
                        <span className="text-sm text-amber-800">{b.titulo}</span>
                      </div>
                      <button
                        onClick={() => handleGoToBloque(b.key as BloqueKey)}
                        className="flex items-center gap-1 text-xs text-guinda-950 hover:underline"
                      >
                        <Edit size={11} />
                        Completar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Lista completa de secciones */}
        <div className="card divide-y divide-gray-100 mb-6">
          <div className="px-5 py-3">
            <p className="text-sm font-semibold text-gray-700">Estado de todas las secciones</p>
          </div>
          {BLOQUES_REPORTERO.map(bloque => {
            const status = bloqueStatuses[bloque.key] ?? 'no_iniciado';
            return (
              <div key={bloque.key} className="px-5 py-3.5 flex items-center gap-4">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  status === 'completo' ? 'bg-green-100 text-green-700' :
                  status === 'incompleto' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-400'
                }`}>{bloque.key}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium">{bloque.titulo}</p>
                  <p className="text-xs text-gray-400 truncate">{bloque.descripcion}</p>
                </div>
                <BloqueBadge status={status} />
                {status !== 'completo' && bloque.key !== 'I' && (
                  <button
                    onClick={() => handleGoToBloque(bloque.key as BloqueKey)}
                    className="flex items-center gap-1 text-xs text-guinda-700 hover:text-guinda-950 hover:underline"
                  >
                    <Edit size={11} />
                    Editar
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Botón de envío */}
        <div className="card p-5">
          {puedeEnviar ? (
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Listo para enviar</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Todas las secciones están completas y sin errores. Al enviar el reporte final quedará registrado en el tablero.
                  </p>
                </div>
              </div>
              <Button variant="primary" size="lg" icon={<Send size={16} />} onClick={() => setConfirmOpen(true)}>
                Enviar reporte trimestral
              </Button>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-gray-400 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-500">
                El botón de envío se habilitará cuando todas las secciones estén completas y sin errores de validación.
              </p>
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
        loading={submitting}
        title="Confirmar envío del reporte"
        message="¿Está seguro de enviar el reporte trimestral final? Una vez enviado, el reporte quedará registrado en el tablero."
        confirmLabel="Sí, enviar reporte"
      />
    </div>
  );
}
