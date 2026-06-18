import { supabase } from '../lib/supabase';
import { getEstructura } from './estructura';
import { getEstados } from './reference';
import { getPeriodos } from './periodos';
import { emptyFormData } from '../data/mockReports';
import { deriveStatuses } from '../lib/completeness';
import { calcularConsolidacion } from '../lib/scoring';
import type { FormData, MockReport, BloqueKey, BloqueStatus, NivelConsolidacion } from '../types';
import type { EstructuraSEA, EstructuraEstado } from '../data/estructura';

const ALL_BLOQUES: BloqueKey[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const EST_VACIA: EstructuraEstado = { cs: 0, cpc: 0, cc: 0, crsf: 0, st: 0 };

interface ReporteRow {
  estado_id: string;
  periodo_id: string;
  status: MockReport['status'];
  progreso: number;
  form_data: FormData;
  ultimo_guardado: string | null;
  fecha_envio: string | null;
  comentarios_admin: string;
  updated_at: string;
}

// Se lanza cuando la fila en la BD es más nueva que la versión que el cliente
// creía editar (otra sesión/pestaña la modificó). Las vistas la traducen al
// aviso "reporte modificado en otra sesión, recargue".
export class ReportConflictError extends Error {
  constructor() {
    super('El reporte fue modificado en otra sesión.');
    this.name = 'ReportConflictError';
  }
}

// Los bloqueStatuses no se almacenan: se recomputan al leer. Para un reporte
// `enviado` se confía en el estado guardado (todo `completo`, 100%) en lugar de
// recomputar, igual que la semántica de `submitReport`; los borradores se
// derivan del form_data actual.
function toReport(r: ReporteRow, estructura: EstructuraSEA): MockReport {
  const est = estructura[r.estado_id] ?? EST_VACIA;
  let bloqueStatuses: Record<string, BloqueStatus>;
  let progreso: number;
  if (r.status === 'enviado') {
    bloqueStatuses = Object.fromEntries(ALL_BLOQUES.map(k => [k, 'completo'])) as Record<string, BloqueStatus>;
    progreso = 100;
  } else {
    ({ bloqueStatuses, progreso } = deriveStatuses(r.form_data, est));
  }
  return {
    estadoId: r.estado_id,
    periodoId: r.periodo_id,
    status: r.status,
    progreso,
    bloqueStatuses,
    formData: r.form_data,
    ultimo_guardado: r.ultimo_guardado,
    fecha_envio: r.fecha_envio,
    updated_at: r.updated_at,
    comentarios_admin: r.comentarios_admin,
  };
}

// Escritura con control de concurrencia optimista. Si `expectedUpdatedAt` viene
// dado, hace un UPDATE condicionado a que la fila siga en esa versión; 0 filas
// afectadas ⇒ alguien la cambió antes ⇒ ReportConflictError. Sin
// `expectedUpdatedAt` es la primera escritura (no existe fila): INSERT, y una
// colisión de unicidad (otra sesión la creó primero) también es conflicto.
type WriteFields = {
  status: MockReport['status'];
  progreso: number;
  puntaje: number;
  nivel: NivelConsolidacion;
  ultimo_guardado: string;
  fecha_envio?: string;
};

async function writeReport(
  estadoId: string,
  periodoId: string,
  formData: FormData,
  fields: WriteFields,
  expectedUpdatedAt: string | null | undefined,
  estructura: EstructuraSEA,
): Promise<MockReport> {
  const payload = { estado_id: estadoId, periodo_id: periodoId, form_data: formData, ...fields };

  if (expectedUpdatedAt) {
    const { data, error } = await supabase
      .from('reportes')
      .update(payload)
      .eq('estado_id', estadoId)
      .eq('periodo_id', periodoId)
      .eq('updated_at', expectedUpdatedAt)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new ReportConflictError();
    return toReport(data as ReporteRow, estructura);
  }

  const { data, error } = await supabase.from('reportes').insert(payload).select().single();
  if (error) {
    if ((error as { code?: string }).code === '23505') throw new ReportConflictError(); // unique_violation
    throw error;
  }
  return toReport(data as ReporteRow, estructura);
}

// Formulario vacío para un estado, con la identidad (bloque A) ya poblada desde
// el estado en la BD. `periodoId` sella bloque_a.periodo para el período correcto
// (antes quedaba fijo en '2026-Q1' para cualquier período).
async function emptyForm(estadoId: string, periodoId: string): Promise<FormData> {
  const titular = (await getEstados()).find(e => e.id === estadoId)?.titular ?? '';
  return emptyFormData(estadoId, titular, periodoId);
}

// Período más antiguo que se consulta al sembrar: el arrastre de respuestas no
// retrocede más allá de Q1 2026 (no hay datos previos en el sistema).
const SEED_FLOOR_PERIODO_ID = '2026-Q1';

// Formulario con el que se siembra el buffer cuando un estado aún no tiene
// reporte para `periodoId`: arrastra las respuestas del reporte trabajado más
// reciente, recorriendo hacia atrás los períodos anteriores hasta Q1 2026
// inclusive. Si ninguno en ese rango fue trabajado (no existe o quedó sin
// iniciar), devuelve un formulario vacío. El bloque A (identificación) se
// reescribe para que no quede el del período anterior.
export async function getSeedForm(estadoId: string, periodoId: string): Promise<FormData> {
  const periodos = await getPeriodos();
  const current = periodos.find(p => p.id === periodoId);
  const floor = periodos.find(p => p.id === SEED_FLOOR_PERIODO_ID);
  if (current && floor) {
    // Períodos anteriores al actual y no anteriores al piso, más reciente
    // primero: el orden por `fecha_cierre` es la secuencia real de reporte.
    const previos = periodos
      .filter(p => p.fecha_cierre < current.fecha_cierre && p.fecha_cierre >= floor.fecha_cierre)
      .sort((a, b) => b.fecha_cierre.localeCompare(a.fecha_cierre));
    for (const p of previos) {
      const prev = await getReport(estadoId, p.id);
      if (prev && prev.status !== 'sin_iniciar') {
        const carried = structuredClone(prev.formData);
        // Reescribir bloque_a para este período (no arrastrar el del anterior).
        carried.bloque_a = (await emptyForm(estadoId, periodoId)).bloque_a;
        // Activar el rastreo de revisión: ninguna sección heredada cuenta como
        // completa hasta que el reportero la confirme en este período.
        carried.revisados = [];
        return carried;
      }
    }
  }
  return emptyForm(estadoId, periodoId);
}

// Período por defecto para el tablero del admin: el más reciente (por
// fecha_cierre) que tenga algún reporte. Si ninguno tiene reportes, el más
// reciente en general; null solo si no hay períodos.
export async function getLatestReportedPeriodoId(): Promise<string | null> {
  const [res, periodos] = await Promise.all([
    supabase.from('reportes').select('periodo_id'),
    getPeriodos(),
  ]);
  if (res.error) throw res.error;
  const conReportes = new Set((res.data as { periodo_id: string }[]).map(r => r.periodo_id));
  const latest = periodos.find(p => conReportes.has(p.id)); // periodos ya vienen ordenados desc
  return latest?.id ?? periodos[0]?.id ?? null;
}

export async function getReports(periodoId: string): Promise<MockReport[]> {
  const [res, estructura] = await Promise.all([
    supabase.from('reportes').select('*').eq('periodo_id', periodoId),
    getEstructura(),
  ]);
  if (res.error) throw res.error;
  return (res.data as ReporteRow[]).map(r => toReport(r, estructura));
}

// Devuelve null (no undefined) cuando no existe reporte: react-query v5 rechaza
// un queryFn que resuelve a undefined ("Query data cannot be undefined"), lo que
// dejaba la consulta en error y `isSuccess` en false para siempre en períodos sin
// reportes —y con ello la siembra de formData colgada en "Cargando…".
export async function getReport(estadoId: string, periodoId: string): Promise<MockReport | null> {
  const [res, estructura] = await Promise.all([
    supabase.from('reportes').select('*').eq('estado_id', estadoId).eq('periodo_id', periodoId).maybeSingle(),
    getEstructura(),
  ]);
  if (res.error) throw res.error;
  if (!res.data) return null;
  return toReport(res.data as ReporteRow, estructura);
}

export async function saveReport(
  estadoId: string,
  periodoId: string,
  formData: FormData,
  expectedUpdatedAt?: string | null,
): Promise<MockReport> {
  const estructura = await getEstructura();
  // No degradar un reporte ya enviado a borrador (p. ej. un admin editando una
  // sección de un reporte enviado). Si esta lectura quedara obsoleta, el guard
  // de updated_at en writeReport rechaza la escritura de todos modos.
  const { data: existing, error: e0 } = await supabase
    .from('reportes')
    .select('status')
    .eq('estado_id', estadoId)
    .eq('periodo_id', periodoId)
    .maybeSingle();
  if (e0) throw e0;
  const enviado = existing?.status === 'enviado';
  const status: MockReport['status'] = enviado ? 'enviado' : 'borrador';
  const { progreso } = deriveStatuses(formData, estructura[estadoId] ?? EST_VACIA);
  const { puntaje, nivel } = calcularConsolidacion(formData.bloque_j);

  return writeReport(
    estadoId,
    periodoId,
    formData,
    { status, progreso: enviado ? 100 : progreso, puntaje, nivel, ultimo_guardado: new Date().toISOString() },
    expectedUpdatedAt,
    estructura,
  );
}

export async function submitReport(
  estadoId: string,
  periodoId: string,
  formData: FormData,
  expectedUpdatedAt?: string | null,
): Promise<MockReport> {
  const now = new Date().toISOString();
  const estructura = await getEstructura();
  const { puntaje, nivel } = calcularConsolidacion(formData.bloque_j);
  return writeReport(
    estadoId,
    periodoId,
    formData,
    { status: 'enviado', progreso: 100, puntaje, nivel, ultimo_guardado: now, fecha_envio: now },
    expectedUpdatedAt,
    estructura,
  );
}

// Actualiza solo `comentarios_admin` (lo edita el admin desde ReportDetail).
// Va guardado con el mismo control de concurrencia que el resto.
export async function updateComentariosAdmin(
  estadoId: string,
  periodoId: string,
  comentarios: string,
  expectedUpdatedAt: string | null,
): Promise<MockReport> {
  const estructura = await getEstructura();
  const { data, error } = await supabase
    .from('reportes')
    .update({ comentarios_admin: comentarios })
    .eq('estado_id', estadoId)
    .eq('periodo_id', periodoId)
    .eq('updated_at', expectedUpdatedAt)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new ReportConflictError();
  return toReport(data as ReporteRow, estructura);
}
