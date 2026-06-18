import { supabase } from '../lib/supabase';
import type { Periodo } from '../types';

interface PeriodoRow {
  id: string;
  label: string;
  tipo: 'mensual' | 'trimestral';
  anio: number;
  trimestre: number | null;
  mes: number | null;
  fecha_apertura: string;
  fecha_cierre: string;
  activo: boolean;
  archivado: boolean;
}

function toPeriodo(r: PeriodoRow): Periodo {
  return {
    id: r.id,
    label: r.label,
    tipo: r.tipo,
    anio: r.anio,
    trimestre: r.trimestre ?? undefined,
    mes: r.mes ?? undefined,
    fecha_apertura: r.fecha_apertura,
    fecha_cierre: r.fecha_cierre,
    activo: r.activo,
    archivado: r.archivado,
  };
}

// Períodos vigentes (no archivados). Orden por `fecha_cierre` desc = secuencia
// real de reporte, más reciente primero. Los archivados se excluyen de todas las
// vistas/selecciones; se listan aparte con getArchivedPeriodos.
export async function getPeriodos(): Promise<Periodo[]> {
  const { data, error } = await supabase
    .from('periodos')
    .select('*')
    .eq('archivado', false)
    .order('fecha_cierre', { ascending: false });
  if (error) throw error;
  return (data as PeriodoRow[]).map(toPeriodo);
}

export async function getArchivedPeriodos(): Promise<Periodo[]> {
  const { data, error } = await supabase
    .from('periodos')
    .select('*')
    .eq('archivado', true)
    .order('fecha_cierre', { ascending: false });
  if (error) throw error;
  return (data as PeriodoRow[]).map(toPeriodo);
}

// Devuelve null cuando no hay período activo (todos cerrados): es un estado
// válido —la captura queda cerrada— y las vistas lo manejan explícitamente. Sin
// respaldo al más reciente, para que "cerrar" realmente bloquee la captura.
export async function getActivePeriodo(): Promise<Periodo | null> {
  const { data, error } = await supabase
    .from('periodos')
    .select('*')
    .eq('activo', true)
    .eq('archivado', false)
    .maybeSingle();
  if (error) throw error;
  return data ? toPeriodo(data as PeriodoRow) : null;
}

// Upsert por id: crear un período cuyo id ya existe archivado lo "desarchiva" y
// reacopla sus reportes (la otra vía de restauración además del listado).
export async function createPeriodo(periodo: Periodo): Promise<Periodo> {
  const { error } = await supabase.from('periodos').upsert(
    {
      id: periodo.id,
      label: periodo.label,
      tipo: periodo.tipo,
      anio: periodo.anio,
      trimestre: periodo.trimestre ?? null,
      mes: periodo.mes ?? null,
      fecha_apertura: periodo.fecha_apertura,
      fecha_cierre: periodo.fecha_cierre,
      activo: periodo.activo,
      archivado: false,
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
  return periodo;
}

// Soft-delete: archiva el período (lo oculta del admin) sin tocar los reportes.
// No archiva un período activo (.eq activo,false): la UI exige cerrarlo antes.
export async function deletePeriodo(id: string): Promise<void> {
  const { error } = await supabase
    .from('periodos')
    .update({ archivado: true })
    .eq('id', id)
    .eq('activo', false);
  if (error) throw error;
}

export async function restorePeriodo(id: string): Promise<void> {
  const { error } = await supabase.from('periodos').update({ archivado: false }).eq('id', id);
  if (error) throw error;
}

// Solo puede haber un período activo (índice único parcial). Desactivar el
// vigente primero evita violar el índice; `id` vacío deja todos inactivos.
export async function setActivePeriodo(id: string): Promise<void> {
  const { error: e1 } = await supabase.from('periodos').update({ activo: false }).eq('activo', true);
  if (e1) throw e1;
  if (!id) return;
  const { error: e2 } = await supabase.from('periodos').update({ activo: true }).eq('id', id);
  if (e2) throw e2;
}

// Período inmediatamente anterior, sin importar la cadencia. Ordenamos por
// `fecha_cierre` (cierre del reporte): ya incorpora el desfase de reporte (Q1
// cierra en abril, enero cierra en febrero) y, a diferencia de `fecha_apertura`,
// no empata entre el trimestre y el mes que abren el mismo día. Las fechas son
// 'YYYY-MM-DD', así que el orden lexicográfico es cronológico. Pura: no toca la
// red, para poder reusarla sobre la lista ya cargada.
export function previousPeriodoId(periodos: Periodo[], periodoId: string): string | undefined {
  const current = periodos.find(p => p.id === periodoId);
  if (!current) return undefined;
  const anterior = periodos
    .filter(p => p.fecha_cierre < current.fecha_cierre)
    .sort((a, b) => b.fecha_cierre.localeCompare(a.fecha_cierre))[0];
  return anterior?.id;
}
