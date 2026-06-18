import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Save, ArrowRight, Home, ChevronRight } from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader';
import { FormSidebar } from '../../components/layout/FormSidebar';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../contexts/AppContext';
import { useEstructura } from '../../hooks/useEstructura';
import { useActivePeriodo } from '../../hooks/usePeriodos';
import { BLOQUES, BLOQUES_REPORTERO } from '../../data/bloques';
import { getEstructura } from '../../data/estructura';
import { deriveStatuses } from '../../lib/completeness';
import { validarSumaCapitulos } from '../../lib/validation';
import { Loading } from '../../components/ui/AsyncStates';
import type { BloqueKey } from '../../types';

// Bloques (la letra mostrada se reasignó al fusionar las designaciones en B;
// los componentes y los campos de formData conservan su nombre original).
import { BloqueA } from '../../components/blocks/BloqueA';
import { BloqueB } from '../../components/blocks/BloqueB';
import { BloqueE } from '../../components/blocks/BloqueE';
import { BloqueF } from '../../components/blocks/BloqueF';
import { BloqueG } from '../../components/blocks/BloqueG';
import { BloqueH } from '../../components/blocks/BloqueH';
import { BloqueI } from '../../components/blocks/BloqueI';
import { BloqueJ } from '../../components/blocks/BloqueJ';
import { BloqueL } from '../../components/blocks/BloqueL';

// La sección de consolidación ('I') es solo para administradores; el reportero
// no la captura ni la ve.
const BLOQUE_ORDER: BloqueKey[] = ['A','B','C','D','E','F','G','H','J'];

export function CaptureForm() {
  const { user, formData, updateBloqueData, markBloqueRevisado, activeBloque, setActiveBloque, addToast, reportStatus, saveDraft } = useApp();
  const { data: estructura, isLoading } = useEstructura();
  const { data: activePeriodo, isLoading: periodoLoading } = useActivePeriodo();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // Sin período de captura abierto: el tablero del reportero muestra el estado
  // "cerrado"; redirigir evita el "Cargando…" perpetuo (formData nunca se siembra).
  if (!periodoLoading && !activePeriodo) return <Navigate to="/reporter/tablero" replace />;

  if (!formData || isLoading || !estructura) {
    return <Loading label="Cargando formulario…" />;
  }

  const isReadOnly = reportStatus === 'enviado';
  const est = getEstructura(estructura, user?.estadoId);
  // Estatus/progreso del sidebar derivados en vivo del buffer de edición.
  const { bloqueStatuses } = deriveStatuses(formData, est);

  // Errors
  const allErrors = validarSumaCapitulos(formData.bloque_f);
  const errorsMap = Object.fromEntries(allErrors.map(e => [e.field, e.message]));

  const bloqueInfo = BLOQUES.find(b => b.key === activeBloque)!;
  const currentIdx = BLOQUE_ORDER.indexOf(activeBloque);

  // El presupuesto es la sección D en el nuevo esquema.
  const bloquearGuardado = (): boolean => {
    if (activeBloque !== 'D') return false;
    const errs = validarSumaCapitulos(formData.bloque_f);
    if (errs.length === 0) return false;
    addToast({ type: 'error', message: errs[0].message });
    return true;
  };

  const handleGuardar = async () => {
    if (saving || bloquearGuardado()) return;
    markBloqueRevisado(activeBloque);
    setSaving(true);
    const ok = await saveDraft();
    setSaving(false);
    if (ok) addToast({ type: 'success', message: 'Borrador guardado correctamente.' });
  };

  const handleSiguiente = async () => {
    if (saving || bloquearGuardado()) return;
    markBloqueRevisado(activeBloque);
    setSaving(true);
    const ok = await saveDraft();
    setSaving(false);
    if (ok) addToast({ type: 'success', message: 'Borrador guardado correctamente.' });
    const nextIdx = currentIdx + 1;
    if (nextIdx < BLOQUE_ORDER.length) {
      setActiveBloque(BLOQUE_ORDER[nextIdx]);
      window.scrollTo(0, 0);
    } else {
      navigate('/reporter/revision');
    }
  };

  function renderBloque() {
    switch (activeBloque) {
      case 'A': return <BloqueA data={formData!.bloque_a} enlaceNombre={user?.nombre} />;
      case 'B': return <BloqueB data={formData!.bloque_b} estructura={est} onChange={d => updateBloqueData('bloque_b', d)} readOnly={isReadOnly} />;
      case 'C': return <BloqueE data={formData!.bloque_e} onChange={d => updateBloqueData('bloque_e', d)} readOnly={isReadOnly} tieneCRSF={est.crsf > 0} tieneCS={est.cs > 0} ccAplica={est.cc > 0} crsfAplica={est.crsf > 0} />;
      case 'D': return <BloqueF data={formData!.bloque_f} onChange={d => updateBloqueData('bloque_f', d)} errors={errorsMap} readOnly={isReadOnly} />;
      case 'E': return <BloqueG data={formData!.bloque_g} onChange={d => updateBloqueData('bloque_g', d)} readOnly={isReadOnly} />;
      case 'F': return <BloqueH data={formData!.bloque_h} onChange={d => updateBloqueData('bloque_h', d)} readOnly={isReadOnly} />;
      case 'G': return <BloqueI data={formData!.bloque_i} onChange={d => updateBloqueData('bloque_i', d)} readOnly={isReadOnly} />;
      case 'H': return <BloqueJ data={formData!.bloque_j} onChange={d => updateBloqueData('bloque_j', d)} readOnly={isReadOnly} />;
      case 'J': return <BloqueL data={formData!.bloque_l} onChange={d => updateBloqueData('bloque_l', d)} readOnly={isReadOnly} />;
      default: return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader compact />

      <div className="flex flex-1 overflow-hidden">
        <FormSidebar bloqueStatuses={bloqueStatuses} readOnly={isReadOnly} bloques={BLOQUES_REPORTERO} />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-2 text-sm text-gray-500 shrink-0">
            <button onClick={() => navigate('/reporter/tablero')} className="flex items-center gap-1 hover:text-guinda-950 transition-colors">
              <Home size={14} />
              Inicio
            </button>
            <ChevronRight size={14} />
            <span className="text-gray-400">Captura trimestral</span>
            <ChevronRight size={14} />
            <span className="font-medium text-gray-700">{bloqueInfo.titulo}</span>
          </div>

          {/* Contenido del bloque */}
          <div className="flex-1 px-6 py-6">
            <div className="max-w-3xl">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-guinda-950 text-white text-xs font-bold">
                    {activeBloque}
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900">{bloqueInfo.titulo}</h2>
                </div>
                <p className="text-sm text-gray-500 ml-9">{bloqueInfo.descripcion}</p>
              </div>

              {isReadOnly && (
                <div className="mb-5 rounded-lg bg-blue-50 border border-blue-100 px-4 py-2.5 flex items-center gap-2">
                  <span className="text-blue-600 text-xs">ℹ</span>
                  <p className="text-xs text-blue-700">Modo solo lectura: el reporte final ya fue enviado.</p>
                </div>
              )}

              {allErrors.length > 0 && activeBloque === 'D' && (
                <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-xs font-semibold text-red-700 mb-1">Validaciones cruzadas con errores</p>
                  {allErrors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600">• {e.message}</p>
                  ))}
                </div>
              )}

              {renderBloque()}
            </div>
          </div>

          {/* Barra inferior fija */}
          {!isReadOnly && (
            <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center gap-3">
              <Button variant="secondary" icon={<Save size={15} />} onClick={handleGuardar} loading={saving}>
                Guardar borrador
              </Button>
              <Button variant="primary" icon={<ArrowRight size={15} />} onClick={handleSiguiente} disabled={saving}>
                {currentIdx < BLOQUE_ORDER.length - 1 ? 'Guardar y continuar' : 'Guardar y revisar'}
              </Button>
              <div className="flex-1" />
              <span className="text-xs text-gray-400">
                Sección {currentIdx + 1} de {BLOQUE_ORDER.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
