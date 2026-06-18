import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AppUser, FormData, BloqueKey, MockReport } from '../types';
import { saveReport, submitReport as submitReportSvc, getSeedForm, ReportConflictError } from '../services/reports';
import { useActivePeriodo } from '../hooks/usePeriodos';
import { useReport } from '../hooks/useReports';
import { qk } from '../hooks/queryKeys';
import { APLICABLES } from '../lib/completeness';

// Sección de formData → letra de bloque, solo para las secciones que cuentan
// para el progreso. Sirve para marcar la sección como revisada al editarla.
const FORMKEY_TO_BLOQUE: Partial<Record<keyof FormData, BloqueKey>> = {
  bloque_b: 'B', bloque_e: 'C', bloque_f: 'D', bloque_g: 'E', bloque_h: 'F', bloque_i: 'G', bloque_j: 'H',
};

// ─── Toast ─────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// ─── Constants ─────────────────────────────────────────────────────

const DEBOUNCE_MS     = 2000;          // auto-guardado 2s después del último cambio
const SAFETY_FLUSH_MS = 60 * 1000;     // red de seguridad: vaciar pendientes c/min
const IDLE_MS       = 30 * 60 * 1000; // 30 minutos de inactividad
const WARNING_SECS  = 60;             // 1 minuto de cuenta regresiva

// ─── Context types ──────────────────────────────────────────────────

interface AppContextValue {
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;

  formData: FormData | null;
  updateBloqueData: <K extends keyof FormData>(bloque: K, data: Partial<FormData[K]>) => void;
  markBloqueRevisado: (key: BloqueKey) => void;
  setFormData: (fd: FormData) => void;
  activeBloque: BloqueKey;
  setActiveBloque: (k: BloqueKey) => void;
  reportStatus: MockReport['status'];
  setReportStatus: (s: MockReport['status']) => void;
  saveDraft: () => Promise<boolean>;
  submitReport: () => Promise<boolean>;
  lastSaved: Date | null;
  autoSaveLabel: string;

  toasts: Toast[];
  addToast: (t: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Sesión
  sessionWarning: boolean;
  sessionCountdown: number;
  continueSession: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [activeBloque, setActiveBloque] = useState<BloqueKey>('A');
  const [reportStatus, setReportStatus] = useState<MockReport['status']>('sin_iniciar');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveLabel, setAutoSaveLabel] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const qc = useQueryClient();
  const { data: activePeriodo } = useActivePeriodo(!!user);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [sessionCountdown, setSessionCountdown] = useState(WARNING_SECS);

  const isDirtyRef        = useRef(false);
  const updatedAtRef      = useRef<string | null>(null); // versión optimista conocida del reporte
  const debounceRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conflictRef       = useRef(false); // evita repetir el aviso de conflicto
  // Cadena de escrituras: serializa todo persistReport para que dos guardados
  // solapados (doble clic, guardado manual durante un auto-guardado en vuelo) no
  // reusen el mismo updated_at y se rechacen entre sí como falso conflicto.
  const writeChainRef     = useRef<Promise<unknown>>(Promise.resolve());
  const idleTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownValRef   = useRef(WARNING_SECS);
  const isWarningRef      = useRef(false);

  // Stable ref to the current user; timers read this to avoid stale closures
  const userRef = useRef<AppUser | null>(null);
  useEffect(() => { userRef.current = user; }, [user]);

  // Stable ref to formData; auto-save reads this
  const formDataRef = useRef<FormData | null>(null);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  // Período activo estable; los timers de guardado leen el id desde aquí.
  const periodoIdRef = useRef<string | undefined>(undefined);
  useEffect(() => { periodoIdRef.current = activePeriodo?.id; }, [activePeriodo]);

  // ─── Toasts ────────────────────────────────────────────────────────

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...t, id }]);
    if (t.type !== 'error') {
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(x => x.id !== id));
  }, []);

  // ─── setUser (wraps logout cleanup) ───────────────────────────────

  const setUser = useCallback((u: AppUser | null) => {
    setUserState(u);
    if (!u) {
      // Limpiar timers al cerrar sesión
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      idleTimerRef.current = null;
      countdownRef.current = null;
      isWarningRef.current = false;
      setSessionWarning(false);
      setSessionCountdown(WARNING_SECS);
    }
  }, []);

  // ─── Persistencia unificada ────────────────────────────────────────
  // Única función de guardado: delega en el repositorio (que recalcula los
  // estatus derivados y sella ultimo_guardado) e invalida las queries para que
  // las vistas se refresquen. El repositorio es hoy en memoria; en los Pasos
  // 5–6 su cuerpo se reemplaza por Supabase sin tocar esta función.
  const persistReport = useCallback((estadoId: string, fd: FormData, opts?: { submit?: boolean }): Promise<boolean> => {
    const run = async (): Promise<boolean> => {
      const periodoId = periodoIdRef.current;
      if (!periodoId) return false;
      try {
        // Concurrencia optimista: enviamos la última versión conocida; si la fila
        // en la BD es más nueva, el servicio lanza ReportConflictError. Al estar
        // serializado por writeChainRef, leemos updatedAtRef ya actualizado por la
        // escritura previa de esta misma sesión.
        const saved = opts?.submit
          ? await submitReportSvc(estadoId, periodoId, fd, updatedAtRef.current)
          : await saveReport(estadoId, periodoId, fd, updatedAtRef.current);
        updatedAtRef.current = saved.updated_at ?? null;
        conflictRef.current = false;
        setLastSaved(saved.ultimo_guardado ? new Date(saved.ultimo_guardado) : new Date());
        // setQueryData en vez de invalidar el reporte: evita un refetch en cada
        // auto-guardado. La lista del tablero sí se invalida.
        qc.setQueryData(qk.report(estadoId, periodoId), saved);
        qc.invalidateQueries({ queryKey: qk.reports(periodoId) });
        return true;
      } catch (e) {
        if (e instanceof ReportConflictError) {
          if (!conflictRef.current) {
            conflictRef.current = true;
            addToast({ type: 'error', message: 'El reporte fue modificado en otra sesión. Recargue la página para no perder cambios.' });
          }
        } else {
          addToast({ type: 'error', message: 'No se pudo guardar el reporte.' });
        }
        return false;
      }
    };
    // Encolar tras la escritura anterior (corra como corra), y mantener la cadena
    // viva ignorando el resultado para los siguientes encolados.
    const result = writeChainRef.current.then(run, run);
    writeChainRef.current = result.catch(() => {});
    return result;
  }, [qc, addToast]);

  // Vaciar ediciones pendientes (auto-guardado). Punto único que comparten el
  // debounce, la red de seguridad, el idle-logout y beforeunload.
  const flushIfDirty = useCallback(() => {
    if (isDirtyRef.current && formDataRef.current && userRef.current?.estadoId) {
      isDirtyRef.current = false;
      persistReport(userRef.current.estadoId, formDataRef.current).then(ok => {
        if (ok) {
          setAutoSaveLabel('Guardado automáticamente');
          setTimeout(() => setAutoSaveLabel(''), 3000);
        }
      });
    }
  }, [persistReport]);

  const flushRef = useRef(flushIfDirty);
  useEffect(() => { flushRef.current = flushIfDirty; }, [flushIfDirty]);

  // ─── Session timeout ───────────────────────────────────────────────

  const doLogout = useCallback(() => {
    // Vaciar ediciones pendientes antes de cerrar la sesión.
    flushIfDirty();
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    countdownRef.current = null;
    idleTimerRef.current = null;
    isWarningRef.current = false;
    setSessionWarning(false);
    setUser(null);
  }, [setUser, flushIfDirty]);

  const startCountdown = useCallback(() => {
    isWarningRef.current = true;
    countdownValRef.current = WARNING_SECS;
    setSessionWarning(true);
    setSessionCountdown(WARNING_SECS);

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      countdownValRef.current -= 1;
      setSessionCountdown(countdownValRef.current);
      if (countdownValRef.current <= 0) {
        doLogout();
      }
    }, 1000);
  }, [doLogout]);

  // Esta función se actualiza en cada render, pero el event listener
  // la invoca a través de activityHandlerRef (ver más abajo).
  const resetIdleTimer = useCallback(() => {
    if (!userRef.current || isWarningRef.current) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(startCountdown, IDLE_MS);
  }, [startCountdown]);

  // Referencia estable al handler de actividad; permite usar [] en el useEffect
  const activityHandlerRef = useRef(resetIdleTimer);
  useEffect(() => { activityHandlerRef.current = resetIdleTimer; }, [resetIdleTimer]);

  // Registrar listeners de actividad una sola vez
  useEffect(() => {
    const handler = () => activityHandlerRef.current();
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Arrancar/detener timer al cambiar de usuario
  useEffect(() => {
    if (user) {
      resetIdleTimer();
    } else {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    }
  }, [user, resetIdleTimer]);

  const continueSession = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
    isWarningRef.current = false;
    setSessionWarning(false);
    setSessionCountdown(WARNING_SECS);
    resetIdleTimer();
  }, [resetIdleTimer]);

  // ─── Form data ─────────────────────────────────────────────────────

  // Cargar el reporte del estado activo en el buffer de edición. Se siembra una
  // sola vez por estado (loadedEstadoRef), de modo que un refetch posterior a un
  // guardado no pise las ediciones en curso. Los estatus/progreso del sidebar se
  // derivan en vivo desde `formData` en CaptureForm/ReviewSubmit.
  const reporterEstadoId = user?.role === 'reporter' ? user.estadoId : undefined;
  const reportQuery = useReport(reporterEstadoId, activePeriodo?.id);
  const loadedReport = reportQuery.data;
  // La clave del buffer es (estado, período): antes solo se sembraba por estado,
  // de modo que cambiar el período activo no recargaba el formulario.
  const loadedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) { loadedKeyRef.current = null; return; }
    const periodoId = activePeriodo?.id;
    if (!reporterEstadoId || !periodoId) return;
    // Esperar a que la consulta resuelva para distinguir "cargando" de "sin reporte".
    if (!reportQuery.isSuccess) return;
    const key = `${reporterEstadoId}|${periodoId}`;
    // La clave se marca como cargada solo cuando el buffer queda sembrado (más
    // abajo), no aquí: si la sembrada asíncrona se cancela (p. ej. el doble
    // montaje de StrictMode o un cambio de período) la clave debe quedar libre
    // para que el remontaje vuelva a sembrar, en lugar de quedar "Cargando…".
    if (loadedKeyRef.current === key) return;
    // Reiniciar el estado de guardado al cargar otro (estado, período): cancelar
    // un debounce pendiente, limpiar dirty y el aviso de conflicto.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    isDirtyRef.current = false;
    conflictRef.current = false;

    if (loadedReport) {
      loadedKeyRef.current = key;
      setFormData(loadedReport.formData);
      setReportStatus(loadedReport.status);
      setLastSaved(loadedReport.ultimo_guardado ? new Date(loadedReport.ultimo_guardado) : null);
      updatedAtRef.current = loadedReport.updated_at ?? null;
      return;
    }

    // No existe reporte para este (estado, período): sembrar el buffer con las
    // respuestas del período anterior (o un formulario vacío) para que sea
    // editable en lugar de quedar cargando para siempre.
    let cancelled = false;
    getSeedForm(reporterEstadoId, periodoId).then(form => {
      if (cancelled) return;
      loadedKeyRef.current = key;
      setFormData(form);
      setReportStatus('sin_iniciar');
      setLastSaved(null);
      updatedAtRef.current = null; // aún no existe fila: la 1ª escritura es INSERT
    });
    return () => { cancelled = true; };
  }, [user, reporterEstadoId, activePeriodo?.id, reportQuery.isSuccess, loadedReport]);

  const updateBloqueData = useCallback(<K extends keyof FormData>(bloque: K, data: Partial<FormData[K]>) => {
    const current = formDataRef.current;
    if (!current) return;
    let next = { ...current, [bloque]: { ...current[bloque], ...data } };
    // Si se está rastreando la revisión (reporte arrastrado), editar una sección
    // la confirma para este período.
    const bkey = FORMKEY_TO_BLOQUE[bloque];
    if (next.revisados && bkey && !next.revisados.includes(bkey)) {
      next = { ...next, revisados: [...next.revisados, bkey] };
    }
    setFormData(next);
    isDirtyRef.current = true;
    if (reportStatus === 'sin_iniciar') setReportStatus('borrador');
    // Auto-guardado con debounce: persistir 2s después del último cambio.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => flushRef.current(), DEBOUNCE_MS);
  }, [reportStatus]);

  // Confirmar una sección sin editarla (botón "Guardar y continuar"): marca el
  // bloque como revisado en este período. No-op si no se rastrea la revisión o
  // si el bloque no cuenta para el progreso (A/I/J). El guardado lo dispara
  // saveDraft a continuación, así que aquí no se persiste.
  const markBloqueRevisado = useCallback((key: BloqueKey) => {
    const current = formDataRef.current;
    if (!current?.revisados || !APLICABLES.includes(key) || current.revisados.includes(key)) return;
    const next = { ...current, revisados: [...current.revisados, key] };
    // Actualizar también el ref de inmediato: saveDraft (que se llama justo
    // después en el handler) lee formDataRef.current de forma síncrona, antes de
    // que el efecto que sincroniza el ref corra tras el render.
    formDataRef.current = next;
    setFormData(next);
  }, []);

  // ─── Red de seguridad del auto-guardado ───────────────────────────
  // El debounce cubre el guardado normal; este intervalo vacía cualquier
  // pendiente cada minuto por si el debounce no llegó a disparar.
  useEffect(() => {
    const interval = setInterval(() => flushRef.current(), SAFETY_FLUSH_MS);
    return () => clearInterval(interval);
  }, []);

  // Vaciar ediciones pendientes al cerrar/recargar la pestaña.
  useEffect(() => {
    const handler = () => flushRef.current();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // ─── Guardado manual / envío del reporte ───────────────────────────

  const saveDraft = useCallback(async (): Promise<boolean> => {
    const estadoId = userRef.current?.estadoId;
    const fd = formDataRef.current;
    if (!estadoId || !fd) return false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    isDirtyRef.current = false;
    return persistReport(estadoId, fd);
  }, [persistReport]);

  const submitReport = useCallback(async (): Promise<boolean> => {
    const estadoId = userRef.current?.estadoId;
    const fd = formDataRef.current;
    if (!estadoId || !fd) return false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    isDirtyRef.current = false;
    const ok = await persistReport(estadoId, fd, { submit: true });
    if (ok) setReportStatus('enviado');
    return ok;
  }, [persistReport]);

  return (
    <AppContext.Provider value={{
      user, setUser,
      formData, updateBloqueData, markBloqueRevisado, setFormData,
      activeBloque, setActiveBloque,
      reportStatus, setReportStatus, saveDraft, submitReport,
      lastSaved, autoSaveLabel,
      toasts, addToast, removeToast,
      sessionWarning, sessionCountdown, continueSession,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
