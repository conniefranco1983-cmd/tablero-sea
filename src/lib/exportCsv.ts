// Exportaciones CSV del lado admin. Dos formatos:
//  1) Designaciones: una persona por fila (como plazas.csv).
//  2) Tablero "base": una entidad por fila, mismas columnas que base.csv
//     (inverso de supabase/seed/generate_seed.py).
import type { MockReport, Estado, BloqueJData, BloqueIData } from '../types';
import { ORGANOS, type EstructuraSEA, type EstructuraEstado } from '../data/estructura';
import { scoreItems, calcularConsolidacion } from './scoring';

// ── CSV helpers ────────────────────────────────────────────────────────────
function field(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === '') return '';
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: (string | number | null | undefined)[][]): string {
  // BOM para que Excel reconozca UTF-8 (igual que base.csv, utf-8-sig).
  return '﻿' + rows.map(r => r.map(field).join(',')).join('\r\n') + '\r\n';
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const EST_VACIA: EstructuraEstado = { cs: 0, cpc: 0, cc: 0, crsf: 0, st: 0 };
const boolLabel = (b: boolean | null): string => (b === true ? 'Sí' : b === false ? 'No' : '');

const SESION_LABEL: Record<string, string> = {
  no_aplica: 'No aplica',
  '1_a_6_meses': '1 a 6 meses',
  '6_meses_1_año': '6 meses a 1 año',
  mas_1_año: 'Más de 1 año',
};
const sesionLabel = (code: string): string => SESION_LABEL[code] ?? '';

// Orden alfabético por nombre = orden de filas de base.csv; ENTIDAD es la
// secuencia 1..N resultante.
function sortedReports(reports: MockReport[], byId: Map<string, Estado>): { report: MockReport; estado: Estado }[] {
  return reports
    .map(r => ({ report: r, estado: byId.get(r.estadoId) }))
    .filter((x): x is { report: MockReport; estado: Estado } => !!x.estado)
    .sort((a, b) => a.estado.nombre.localeCompare(b.estado.nombre, 'es'));
}

// ── 1) Designaciones (una persona por fila) ─────────────────────────────────
const DESIGNACIONES_HEADER = [
  'estado', 'organo', 'designacion', 'fecha inicio', 'fecha termino',
  'nombre', 'apellido paterno', 'apellido materno', 'cargo', 'institución', 'telefono', 'correo',
];

export function buildDesignacionesCsv(reports: MockReport[], estados: Estado[]): string {
  const byId = new Map(estados.map(e => [e.id, e]));
  const rows: (string | number)[][] = [DESIGNACIONES_HEADER];
  for (const { report, estado } of sortedReports(reports, byId)) {
    const des = report.formData.bloque_b.designaciones;
    for (const org of ORGANOS) {
      for (const seat of des[org.key] ?? []) {
        rows.push([
          estado.nombre, org.label,
          boolLabel(seat.vigente),
          seat.fecha_designacion, seat.fecha_termino,
          seat.nombre, seat.apellido_paterno, seat.apellido_materno,
          seat.cargo, seat.institucion, seat.telefono, seat.correo,
        ]);
      }
    }
  }
  return toCsv(rows);
}

// ── 2) Tablero base (una entidad por fila, formato base.csv) ────────────────
const BASE_HEADER = [
  'ENTIDAD', 'NOM_ENT',
  'DES_LEY_TIT', 'DES_LEY_CS', 'DES_LEY_CPC', 'DES_LEY_CC', 'DES_LEY_CRSF',
  'DES_PEND_TIT', 'DES_PEND_CS', 'DES_PEND_CPC', 'DES_PEND_CC', 'DES_PEND_CRSF',
  'DES_VIG_TIT', 'DES_VIG_CS', 'DES_VIG_CPC', 'DES_VIG_CC', 'DES_VIG_CRSF',
  'SES_ULT_CC', 'SES_ULT_CE', 'SES_ULT_CRSF', 'SES_ORD_2026_CC', 'SES_ORD_2026_CE', 'SES_ORD_2026_CRSF',
  'PRES_TOTAL_CPC_2026', 'PRES_TOTAL_SESEA_2023', 'PRES_TOTAL_SESEA_2024', 'PRES_TOTAL_SESEA_2025', 'PRES_TOTAL_SESEA_2026',
  'PRES_CAP_1000', 'PRES_CAP_2000', 'PRES_CAP_3000', 'PRES_CAP_4000', 'PRES_CAP_5000',
  'PRES_CAP_6000', 'PRES_CAP_7000', 'PRES_CAP_8000', 'PRES_CAP_9000',
  'ESTRU_PP', 'ESTRU_PDE', 'ESTRU_JA', 'ESTRU_OFT', 'ESTRU_OTRO',
  'CAP_PLAT', 'CAP_CURSOS', 'CAP_SERV_PUB',
  'NORM_CL', 'NORM_CPE', 'NORM_LFS', 'NORM_LEA', 'NORM_LOAPE', 'NORM_LOFGL', 'NORM_LOTJAE', 'NORM_LRAE', 'NORM_TEXT',
  'GRADO_CONS_PIPEA_APROB', 'GRADO_CONS_PIPEA_EJEC', 'GRADO_CONS_IMPL_MEC_SEG', 'GRADO_CONS_IMPL_LINK_MEC_SEG',
  'GRADO_CONS_IMPL_INFORMES_SEG', 'GRADO_CONS_IMPL_LINK_INFORMES_SEG', 'GRADO_CONS_IMPL_CC_INFORMES_SEG',
  'GRADO_CONS_PRESUP_INST', 'GRADO_CONS_PRESUP_METOD', 'GRADO_CONS_INDIC_CC', 'GRADO_CONS_INDIC_INFORMES',
  'GRADO_CONS_INDIC_FICHAS', 'GRADO_CONS_EVAL_PEA', 'GRADO_CONS_EVAL_INFORMES', 'GRADO_CONS_EVAL_METOD',
  'GRADO_CONS_EVAL_ESTRATEG', 'GRADO_CONS_EVAL_RUTA',
  'GRADO_CONS_PIPEA_APROB_NUM', 'GRADO_CONS_PIPEA_EJEC_NUM', 'GRADO_CONS_IMPL_MEC_SEG_NUM', 'GRADO_CONS_IMPL_LINK_MEC_SEG_NUM',
  'GRADO_CONS_IMPL_INFORMES_SEG_NUM', 'GRADO_CONS_IMPL_LINK_INFORMES_SEG_NUM', 'GRADO_CONS_IMPL_CC_INFORMES_SEG_NUM',
  'GRADO_CONS_PRESUP_INST_NUM', 'GRADO_CONS_PRESUP_METOD_NUM', 'GRADO_CONS_INDIC_CC_NUM', 'GRADO_CONS_INDIC_INFORMES_NUM',
  'GRADO_CONS_INDIC_FICHAS_NUM', 'GRADO_CONS_EVAL_PEA_NUM', 'GRADO_CONS_EVAL_INFORMES_NUM', 'GRADO_CONS_EVAL_METOD_NUM',
  'GRADO_CONS_EVAL_ESTRATEG_NUM', 'GRADO_CONS_EVAL_RUTA_NUM',
  'GRADO_CONS_TOTAL', 'GRADO_CONS_TEXT', 'GRADO_CONS_PORC',
  'GRADO_CONS_IMPLEM_TEXT', 'GRADO_CONS_IMPLEM_NUM', 'GRADO_CONS_INDIC_TEXT', 'GRADO_CONS_INIDC_NUM',
  'GRADO_CONS_SYE_TEXT', 'GRADO_CONS_SYE_NUM',
  'EXP_SUB_TEXT', 'NOTAS',
];

// Reactivos GRADO_CONS en el orden de columnas (Sí/No 55-71 y _NUM 72-88).
const SCORE_KEYS: (keyof ReturnType<typeof scoreItems>)[] = [
  'pipea_aprob', 'pipea_ejec', 'impl_mec_seg', 'impl_link_mec_seg', 'impl_informes_seg',
  'impl_link_informes_seg', 'impl_cc_informes_seg', 'presup_inst', 'presup_metod',
  'indic_cc', 'indic_informes', 'indic_fichas', 'eval_pea', 'eval_informes',
  'eval_metod', 'eval_estrateg', 'eval_ruta',
];

const LEYES: (keyof BloqueIData)[] = ['constitucion', 'cpe', 'lfs', 'lea', 'loape', 'lofgl', 'lotjae', 'lrae'];
function normText(i: BloqueIData): string {
  return LEYES.map(k => i[k].descripcion.trim()).filter(Boolean).join(' ');
}

function baseRow(report: MockReport, estado: Estado, est: EstructuraEstado, entidad: number): (string | number)[] {
  const fd = report.formData;
  const b = fd.bloque_b.designaciones;
  const e = fd.bloque_e, f = fd.bloque_f, g = fd.bloque_g, h = fd.bloque_h, i = fd.bloque_i;
  const j: BloqueJData = fd.bloque_j;
  const vig = (k: keyof EstructuraEstado) => (b[k] ?? []).filter(s => s.vigente === true).length;
  const pend = (k: keyof EstructuraEstado) => (b[k] ?? []).filter(s => s.vigente === false).length;

  const items = scoreItems(j);
  const { puntaje, puntaje_impl, puntaje_indic, puntaje_sye } = calcularConsolidacion(j);
  const pct = (n: number) => `${n}%`;

  return [
    entidad, estado.nombre,
    est.st, est.cs, est.cpc, est.cc, est.crsf,
    pend('st'), pend('cs'), pend('cpc'), pend('cc'), pend('crsf'),
    vig('st'), vig('cs'), vig('cpc'), vig('cc'), vig('crsf'),
    sesionLabel(e.ult_sesion_cc), sesionLabel(e.ult_sesion_ce), sesionLabel(e.ult_sesion_crsf),
    e.sesiones_prog_cc_2026, e.sesiones_prog_ce_2026, e.sesiones_prog_crsf_2026,
    f.presupuesto_cpc_2026, f.presupuesto_2023, f.presupuesto_2024, f.presupuesto_2025, f.presupuesto_2026,
    f.cap_1000, f.cap_2000, f.cap_3000, f.cap_4000, f.cap_5000, f.cap_6000, f.cap_7000, f.cap_8000, f.cap_9000,
    g.plazas_politica_publica, g.plazas_plataforma_digital, g.plazas_juridico_admin, g.plazas_titular, g.plazas_otra,
    boolLabel(h.tiene_plataforma), h.num_cursos_vigentes, h.num_servidores_capacitados,
    boolLabel(i.constitucion.tuvo_cambios), boolLabel(i.cpe.tuvo_cambios), boolLabel(i.lfs.tuvo_cambios),
    boolLabel(i.lea.tuvo_cambios), boolLabel(i.loape.tuvo_cambios), boolLabel(i.lofgl.tuvo_cambios),
    boolLabel(i.lotjae.tuvo_cambios), boolLabel(i.lrae.tuvo_cambios), normText(i),
    // GRADO_CONS Sí/No (55-71)
    ...SCORE_KEYS.map(k => (items[k] > 0 ? 'Sí' : 'No')),
    // GRADO_CONS _NUM (72-88)
    ...SCORE_KEYS.map(k => items[k]),
    // Totales (89-97). TEXT/IMPLEM_TEXT/INDIC_TEXT son narrativas no capturadas → vacías.
    puntaje, '', pct(puntaje),
    '', pct(puntaje_impl), '', pct(puntaje_indic),
    j.eval_hallazgos, pct(puntaje_sye),
    fd.bloque_l.experiencias, fd.bloque_l.notas,
  ];
}

export function buildBaseCsv(reports: MockReport[], estados: Estado[], estructura: EstructuraSEA): string {
  const byId = new Map(estados.map(e => [e.id, e]));
  // Fila de índices numéricos como en base.csv (decorativa).
  const indexRow = BASE_HEADER.map((_, idx) => (idx === 0 || idx === BASE_HEADER.length - 1 ? '' : String(idx)));
  const rows: (string | number)[][] = [indexRow, BASE_HEADER];
  sortedReports(reports, byId).forEach(({ report, estado }, n) => {
    rows.push(baseRow(report, estado, estructura[estado.id] ?? EST_VACIA, n + 1));
  });
  return toCsv(rows);
}
