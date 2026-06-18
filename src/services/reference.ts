import { supabase } from '../lib/supabase';
import type { Estado } from '../types';

interface EstadoRow {
  id: string;
  nombre: string;
  abrev: string;
  titular: string;
  correo: string;
  tiene_cs: boolean;
  tiene_crsf: boolean;
}

export async function getEstados(): Promise<Estado[]> {
  const { data, error } = await supabase.from('estados').select('*').order('nombre');
  if (error) throw error;
  return (data as EstadoRow[]).map(r => ({
    id: r.id,
    nombre: r.nombre,
    abrev: r.abrev,
    titular: r.titular,
    correo: r.correo,
    tieneCS: r.tiene_cs,
    tieneCRSF: r.tiene_crsf,
  }));
}
