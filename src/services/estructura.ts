import { supabase } from '../lib/supabase';
import type { EstructuraSEA, EstructuraEstado } from '../data/estructura';
import type { OrganoKey } from '../types';

interface EstructuraRow {
  estado_id: string;
  organo: OrganoKey;
  n: number;
}

const vacia = (): EstructuraEstado => ({ cs: 0, cpc: 0, cc: 0, crsf: 0, st: 0 });

export async function getEstructura(): Promise<EstructuraSEA> {
  const { data, error } = await supabase.from('estructura_sea').select('*');
  if (error) throw error;
  const out: EstructuraSEA = {};
  for (const r of data as EstructuraRow[]) {
    (out[r.estado_id] ??= vacia())[r.organo] = r.n;
  }
  return out;
}

export async function updateEstructura(estadoId: string, organo: OrganoKey, value: number): Promise<EstructuraSEA> {
  const { error } = await supabase
    .from('estructura_sea')
    .upsert({ estado_id: estadoId, organo, n: value }, { onConflict: 'estado_id,organo' });
  if (error) throw error;
  return getEstructura();
}
