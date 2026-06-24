import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, ChevronRight, Edit3, Save } from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader';
import { FormSidebar } from '../../components/layout/FormSidebar';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmModal, Modal } from '../../components/ui/Modal';
import { useApp } from '../../contexts/AppContext';
import { useReport, useSaveReport, useUpdateComentarios } from '../../hooks/useReports';
import { ReportConflictError } from '../../services/reports';
import { usePeriodos } from '../../hooks/usePeriodos';
import { useEstructura } from '../../hooks/useEstructura';
import { Loading, LoadError } from '../../components/ui/AsyncStates';
import { getEstado } from '../../data/estados';
import { BLOQUES } from '../../data/bloques';
import { getEstructura } from '../../data/estructura';
import { MAX } from '../../lib/fieldLimits';
import { validarSumaCapitulos } from '../../lib/validation';
import { calcularConsolidacion } from '../../lib/scoring';
import type { BloqueKey, FormData, NivelConsolidacion } from '../../types';

// Punto de la sección de consolidación ('I'): guinda según el nivel derivado.
const NIVEL_DOT: Record<NivelConsolidacion, string> = {
  Alto:  'bg-guinda-800',
  Medio: 'bg-guinda-400',
  Bajo:  'bg-guinda-200',
};

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
import { BloqueK } from '../../components/blocks/BloqueK';
import { BloqueL } from '../../components/blocks/BloqueL';

// La sección I (Grado de consolidación) es derivada y no tiene slice editable.
const BLOQUE_FORM_KEYS: Record<Exclude<BloqueKey, 'I'>, keyof FormData> = {
  A: 'bloque_a',
  B: 'bloque_b',
  C: 'bloque_e',
  D: 'bloque_f',
  E: 'bloque_g',
  F: 'bloque_h',
  G: 'bloque_i',
  H: 'bloque_j',
  J: 'bloque_l',
};

function getFormKey(key: BloqueKey): keyof FormData | null {
  return key === 'I' ? null : BLOQUE_FORM_KEYS[key];
}

function cloneFormData(data: FormData): FormData {
  return structuredClone(data);
}

export function ReportDetail() {
  const { estadoId, periodoId } = useParams<{ estadoId: string; periodoId: string }>();
  const { activeBloque, setActiveBloque, addToast } = useApp();
  const { data: periodos } = usePeriodos();
  const periodo = periodos?.find(p => p.id === periodoId);
  const { data: report, isLoading, isError, refetch } = useReport(estadoId, periodoId);
  const { data: estructura } = useEstructura();
  const saveMut = useSaveReport();
  const comentariosMut = useUpdateComentarios();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<FormData | null>(null);
  const [comentarios, setComentarios] = useState('');
  const [seededFor, setSeededFor] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [pendingBloque, setPendingBloque] = useState<BloqueKey | null>(null);
  const [switchConfirmOpen, setSwitchConfirmOpen] = useState(false);

  const estado = getEstado(estadoId!);

  // Sembrar el borrador editable desde el reporte cargado, una sola vez por
  // estado (ajuste de estado durante el render, no en un efecto). Un refetch
  // posterior conserva el mismo estadoId y por tanto no pisa la edición.
  if (report && seededFor !== report.estadoId) {
    setDraft(cloneFormData(report.formData));
    setComentarios(report.comentarios_admin);
    setSeededFor(report.estadoId);
  }

  if (isLoading) return <Loading label="Cargando reporte…" />;
  if (isError) return <LoadError onRetry={() => refetch()} />;

  const activeFormKey = getFormKey(activeBloque);
  if (!estado || !report || !draft || !estructura) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Reporte no encontrado.</p>
            <button onClick={() => navigate(`/admin/tablero?periodo=${periodoId}`)} className="mt-3 text-sm text-guinda-950 hover:underline">
              Volver al tablero
            </button>
          </div>
        </div>
      </div>
    );
  }

  const bloqueInfo = BLOQUES.find(b => b.key === activeBloque)!;
  const canEditActive = activeBloque !== 'I';
  const est = getEstructura(estructura, estadoId);
  // Punto de la sección 'I': gris si el Bloque H no se ha iniciado; si no, según el nivel.
  const consolidacionDot = report.bloqueStatuses['H'] === 'no_iniciado'
    ? 'bg-gray-300'
    : NIVEL_DOT[calcularConsolidacion(report.formData.bloque_j).nivel];

  const updateDraftBloqueData = <K extends keyof FormData>(bloque: K, data: Partial<FormData[K]>) => {
    setDraft(prev => prev ? { ...prev, [bloque]: { ...prev[bloque], ...data } } : prev);
  };

  const fErrors = activeBloque === 'D' ? validarSumaCapitulos(draft.bloque_f) : [];
  const fErrorsMap = Object.fromEntries(fErrors.map(e => [e.field, e.message]));

  const saveActiveSection = () => {
    if (!activeFormKey) return;
    if (activeBloque === 'D') {
      const errs = validarSumaCapitulos(draft.bloque_f);
      if (errs.length > 0) {
        addToast({ type: 'error', message: errs[0].message });
        return;
      }
    }
    saveMut.mutate(
      {
        estadoId: report.estadoId,
        periodoId: periodoId!,
        formData: { ...report.formData, [activeFormKey]: draft[activeFormKey] },
        expectedUpdatedAt: report.updated_at,
      },
      {
        onSuccess: () => {
          setEditing(false);
          addToast({ type: 'success', message: `Sección ${activeBloque} guardada correctamente.` });
        },
        onError: (e) => {
          addToast(
            e instanceof ReportConflictError
              ? { type: 'error', message: 'El reporte fue modificado en otra sesión. Recargue la página.' }
              : { type: 'error', message: 'No se pudo guardar la sección.' },
          );
        },
      },
    );
  };

  const saveComentarios = () => {
    comentariosMut.mutate(
      {
        estadoId: report.estadoId,
        periodoId: periodoId!,
        comentarios,
        expectedUpdatedAt: report.updated_at ?? null,
      },
      {
        onSuccess: () => addToast({ type: 'success', message: 'Comentarios guardados.' }),
        onError: (e) =>
          addToast(
            e instanceof ReportConflictError
              ? { type: 'error', message: 'El reporte fue modificado en otra sesión. Recargue la página.' }
              : { type: 'error', message: 'No se pudieron guardar los comentarios.' },
          ),
      },
    );
  };

  const discardActiveSection = () => {
    if (!activeFormKey) return;
    setDraft(prev => prev ? { ...prev, [activeFormKey]: cloneFormData(report.formData)[activeFormKey] } : prev);
    setEditing(false);
  };

  const goToBloque = (key: BloqueKey) => {
    setActiveBloque(key);
    setEditing(false);
    window.scrollTo(0, 0);
  };

  const handleSelectBloque = (key: BloqueKey) => {
    if (key === activeBloque) return;
    if (editing) {
      setPendingBloque(key);
      setSwitchConfirmOpen(true);
      return;
    }
    goToBloque(key);
  };

  const handleSaveAndSwitch = () => {
    saveActiveSection();
    if (pendingBloque) goToBloque(pendingBloque);
    setPendingBloque(null);
    setSwitchConfirmOpen(false);
  };

  const handleDiscardAndSwitch = () => {
    discardActiveSection();
    if (pendingBloque) goToBloque(pendingBloque);
    setPendingBloque(null);
    setSwitchConfirmOpen(false);
  };

  const handleCancelSwitch = () => {
    setPendingBloque(null);
    setSwitchConfirmOpen(false);
  };

  function renderBloque() {
    if (!draft) return null;
    const fd = draft;
    const readOnly = !editing;
    switch (activeBloque) {
      case 'A': return <BloqueA data={fd.bloque_a} onChange={d => updateDraftBloqueData('bloque_a', d)} readOnly={readOnly} showContactNote={false} />;
      case 'B': return <BloqueB data={fd.bloque_b} estructura={est} onChange={d => updateDraftBloqueData('bloque_b', d)} readOnly={readOnly} />;
      case 'C': return <BloqueE data={fd.bloque_e} onChange={d => updateDraftBloqueData('bloque_e', d)} readOnly={readOnly} tieneCRSF={est.crsf > 0} tieneCS={est.cs > 0} ccAplica={est.cc > 0} crsfAplica={est.crsf > 0} />;
      case 'D': return <BloqueF data={fd.bloque_f} onChange={d => updateDraftBloqueData('bloque_f', d)} errors={fErrorsMap} readOnly={readOnly} />;
      case 'E': return <BloqueG data={fd.bloque_g} onChange={d => updateDraftBloqueData('bloque_g', d)} readOnly={readOnly} />;
      case 'F': return <BloqueH data={fd.bloque_h} onChange={d => updateDraftBloqueData('bloque_h', d)} readOnly={readOnly} />;
      case 'G': return <BloqueI data={fd.bloque_i} onChange={d => updateDraftBloqueData('bloque_i', d)} readOnly={readOnly} />;
      case 'H': return <BloqueJ data={fd.bloque_j} onChange={d => updateDraftBloqueData('bloque_j', d)} readOnly={readOnly} />;
      case 'I': return <BloqueK bloqueJ={fd.bloque_j} />;
      case 'J': return <BloqueL data={fd.bloque_l} onChange={d => updateDraftBloqueData('bloque_l', d)} readOnly={readOnly} />;
      default: return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader compact />

      <div className="flex flex-1 overflow-hidden">
        <FormSidebar bloqueStatuses={report.bloqueStatuses} onSelectBloque={handleSelectBloque} consolidacionDot={consolidacionDot} />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Barra superior */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-2 text-sm text-gray-500 shrink-0 flex-wrap gap-y-2">
            <button onClick={() => navigate(`/admin/tablero?periodo=${periodoId}`)} className="flex items-center gap-1 hover:text-guinda-950">
              <Home size={14} />Tablero
            </button>
            <ChevronRight size={14} />
            <button onClick={() => navigate(`/admin/tablero?periodo=${periodoId}`)} className="hover:text-guinda-950">{estado.nombre}</button>
            <ChevronRight size={14} />
            <span className="font-medium text-gray-700">{bloqueInfo.titulo}</span>
            <div className="flex-1" />
            <span className="text-xs text-gray-500">{estado.nombre} · {periodo?.label ?? periodoId}</span>
            <StatusBadge status={report.status} />
            {canEditActive && (
              editing ? (
                <Button variant="primary" size="sm" icon={<Save size={14} />} onClick={saveActiveSection}>
                  Guardar sección
                </Button>
              ) : (
                <Button variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={() => setEditConfirmOpen(true)}>
                  Editar sección
                </Button>
              )
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 px-6 py-6">
            <div className="max-w-3xl">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-guinda-950 text-white text-xs font-bold">
                    {bloqueInfo.displayKey ?? activeBloque}
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900">{bloqueInfo.titulo}</h2>
                </div>
                <p className="text-sm text-gray-500 ml-9">{bloqueInfo.descripcion}</p>
              </div>
              {editing && (
                <div className="mb-5 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2.5">
                  <p className="text-xs text-amber-700">
                    Edición administrativa activa. Los cambios se guardan solo para esta sección.
                  </p>
                </div>
              )}
              {renderBloque()}

              {/* Comentarios de los administradores (por reporte, no por sección) */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-900 mb-1">Comentarios de los administradores</label>
                <p className="text-xs text-gray-500 mb-2">Notas internas para esta entidad. No visibles para los enlaces.</p>
                <textarea
                  value={comentarios}
                  onChange={e => setComentarios(e.target.value)}
                  rows={3}
                  maxLength={MAX.textoLibre}
                  placeholder="Sin comentarios"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-guinda-700 focus:ring-1 focus:ring-guinda-700"
                />
                <p className={`text-xs text-right tabular-nums ${comentarios.length >= MAX.textoLibre ? 'text-red-600' : 'text-gray-400'}`}>
                  {comentarios.length} / {MAX.textoLibre}
                </p>
                <div className="flex justify-end mt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Save size={14} />}
                    onClick={saveComentarios}
                    loading={comentariosMut.isPending}
                    disabled={comentarios === report.comentarios_admin}
                  >
                    Guardar comentarios
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={editConfirmOpen}
        onClose={() => setEditConfirmOpen(false)}
        onConfirm={() => {
          setEditing(true);
          setEditConfirmOpen(false);
        }}
        title="Confirmar edición"
        message={`Va a editar la sección ${activeBloque}.`}
        confirmLabel="Editar sección"
      />

      <Modal
        open={switchConfirmOpen}
        onClose={handleCancelSwitch}
        title="Se encuentra editando"
        size="sm"
        footer={
          <>
            <Button variant="danger" onClick={handleDiscardAndSwitch}>Descartar cambios</Button>
            <Button variant="primary" onClick={handleSaveAndSwitch}>Confirmar cambios</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Está editando la sección {activeBloque}. Para cambiar de sección, confirme o descarte la edición.
        </p>
      </Modal>
    </div>
  );
}
