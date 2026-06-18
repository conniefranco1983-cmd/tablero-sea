import type { BloqueJData, BloqueKData, NivelConsolidacion } from '../types';

// Puntos por reactivo del grado de consolidación, en el orden de las columnas
// GRADO_CONS_*_NUM de base.csv. Fuente única usada por calcularConsolidacion y
// por la exportación.
export function scoreItems(j: BloqueJData) {
  return {
    pipea_aprob: j.pipea_aprobado === true ? 25 : 0,
    pipea_ejec: j.pipea_ejec === 'en_ejecucion' ? 25 : 0,
    impl_mec_seg: j.impl_mec_seg === true ? 2.5 : 0,
    impl_link_mec_seg: j.impl_link_mec_seg ? 2.5 : 0,
    impl_informes_seg: j.impl_informes_seg === true ? 2.5 : 0,
    impl_link_informes_seg: j.impl_link_informes_seg ? 2.5 : 0,
    impl_cc_informes_seg: j.impl_cc_informes_seg === true ? 2.5 : 0,
    presup_inst: j.presup_inst === true ? 2.5 : 0,
    presup_metod: j.presup_metod === true ? 2.5 : 0,
    indic_cc: j.indic_cc === true ? 2.5 : 0,
    indic_informes: j.indic_informes === true ? 2.5 : 0,
    indic_fichas: j.indic_fichas === true ? 2.5 : 0,
    eval_pea: j.eval_pea === true ? 5 : 0,
    eval_informes: j.eval_informes === true ? 5 : 0,
    eval_metod: j.eval_metod ? 5 : 0,
    eval_estrateg: j.eval_estrateg ? 5 : 0,
    eval_ruta: j.eval_ruta ? 5 : 0,
  };
}

export function calcularConsolidacion(j: BloqueJData): BloqueKData {
  const s = scoreItems(j);

  // Sección implementación (PI-PEA + seguimiento + presupuesto): max 67.5 pts
  const puntaje_impl =
    s.pipea_aprob + s.pipea_ejec + s.impl_mec_seg + s.impl_link_mec_seg + s.impl_informes_seg +
    s.impl_link_informes_seg + s.impl_cc_informes_seg + s.presup_inst + s.presup_metod;

  // Sección indicadores: max 7.5 pts
  const puntaje_indic = s.indic_cc + s.indic_informes + s.indic_fichas;

  // Sección seguimiento y evaluación: max 25 pts
  const puntaje_sye = s.eval_pea + s.eval_informes + s.eval_metod + s.eval_estrateg + s.eval_ruta;

  const puntaje = puntaje_impl + puntaje_indic + puntaje_sye;

  let nivel: NivelConsolidacion;
  if (puntaje >= 75)      nivel = 'Alto';
  else if (puntaje >= 25) nivel = 'Medio';
  else                    nivel = 'Bajo';

  return { puntaje, puntaje_impl, puntaje_indic, puntaje_sye, nivel };
}
