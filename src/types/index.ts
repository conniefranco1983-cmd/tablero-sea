export type UserRole = 'reporter' | 'admin';
export type ReportStatus = 'sin_iniciar' | 'borrador' | 'enviado';
export type BloqueStatus = 'completo' | 'incompleto' | 'no_iniciado';
export type NivelConsolidacion = 'Alto' | 'Medio' | 'Bajo';

export interface AppUser {
  role: UserRole;
  estadoId?: string;
  nombre: string;
  correo: string;
}

export interface Estado {
  id: string;
  nombre: string;
  abrev: string;
  titular: string;
  correo: string;
  tieneCS: boolean;
  tieneCRSF: boolean;
}

export interface Periodo {
  id: string;
  label: string;
  tipo: 'mensual' | 'trimestral';
  anio: number;
  trimestre?: number; // 1-4, presente cuando tipo === 'trimestral'
  mes?: number;       // 1-12, presente cuando tipo === 'mensual'
  fecha_apertura: string;
  fecha_cierre: string;
  activo: boolean;
  archivado?: boolean; // soft-delete: oculto del tablero/selector del admin
}

// ─── Form Data por bloque ───────────────────────────────────────────

export interface BloqueAData {
  entidad: string;
  titular_sesea: string;
  periodo: string;
}

export type OrganoKey = 'cs' | 'cpc' | 'cc' | 'crsf' | 'st';

// Una designación individual contemplada por ley.
export interface DesignacionSeat {
  vigente: boolean | null;
  fecha_designacion: string;
  fecha_termino: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  cargo: string;
  institucion: string;
  telefono: string;
  correo: string;
}

export interface BloqueBData {
  designaciones: Record<OrganoKey, DesignacionSeat[]>;
}

export interface BloqueEData {
  ult_sesion_cc: string;
  ult_sesion_ce: string;
  ult_sesion_crsf: string;
  sesiones_prog_cc_2026: number | '';
  sesiones_prog_ce_2026: number | '';
  sesiones_prog_crsf_2026: number | '';
  integrantes_suficientes: boolean | null;
  cuerpos_no_sesionan: string[];
}

export interface BloqueFData {
  presupuesto_2023: number | '';
  presupuesto_2024: number | '';
  presupuesto_2025: number | '';
  presupuesto_2026: number | '';
  presupuesto_cpc_2026: number | '';
  cap_1000: number | '';
  cap_2000: number | '';
  cap_3000: number | '';
  cap_4000: number | '';
  cap_5000: number | '';
  cap_6000: number | '';
  cap_7000: number | '';
  cap_8000: number | '';
  cap_9000: number | '';
  honorarios_pdte_distintos: boolean | null;
  contratos_vig_cpc_2026: number | '';
  partida_honorarios_cpc: string;
}

export interface BloqueGData {
  plazas_politica_publica: number | '';
  plazas_plataforma_digital: number | '';
  plazas_juridico_admin: number | '';
  plazas_titular: number | '';
  plazas_otra: number | '';
}

export interface BloqueHData {
  tiene_plataforma: boolean | null;
  num_cursos_vigentes: number | '';
  num_servidores_capacitados: number | '';
  temas_cursos: string;
}

export interface CambioNormativo {
  tuvo_cambios: boolean | null;
  descripcion: string;
}

export interface BloqueIData {
  constitucion: CambioNormativo;
  cpe: CambioNormativo;
  lfs: CambioNormativo;
  lea: CambioNormativo;
  loape: CambioNormativo;
  lofgl: CambioNormativo;
  lotjae: CambioNormativo;
  lrae: CambioNormativo;
}

export interface BloqueJData {
  // Sección 1 — PI-PEA (max 50 pts)
  pipea_aprobado: boolean | null;
  // Sub-rama cuando no hay PI-PEA aprobado
  pipea_no_motivos: string;
  pipea_no_fecha_estim: boolean | null;
  pipea_no_fecha: string;
  pipea_fecha_aprob: string;
  pipea_ejec: 'en_ejecucion' | 'no_iniciado' | null;
  pipea_fecha_inicio: string;
  pipea_fecha_prog: string;
  pipea_num_estrategias: number | '';
  pipea_num_lineas: number | '';
  pipea_elem_progr: boolean | null;
  pipea_elem_progr_desc: string;
  pipea_num_inst: number | '';
  pipea_inst_list: string;

  // Sección 2 — Seguimiento a la implementación (max 17.5 pts)
  impl_mec_seg: boolean | null;
  impl_link_mec_seg: string;
  impl_frec_recop: string;
  impl_informes_seg: boolean | null;
  impl_link_informes_seg: string;
  impl_cc_informes_seg: boolean | null;
  impl_num_informes_publ: number | '';
  presup_inst: boolean | null;
  presup_monto_2026: number | '';
  presup_publ: boolean | null;
  presup_link_publ: string;
  presup_metod: boolean | null;
  presup_metod_link: string;

  // Sección 3 — Indicadores (max 7.5 pts)
  indic_cc: boolean | null;
  indic_num: number | '';
  indic_problem_corr: number | '';
  indic_obj_anti: number | '';
  indic_act_inst: number | '';
  indic_instr_vinc: string;
  indic_elem_progr: string;
  indic_ejes: number | '';
  indic_obj_esp: number | '';
  indic_prior: number | '';
  indic_estr: number | '';
  indic_lin_acc: number | '';
  indic_tipo_herr: string;
  indic_link_herr: string;
  indic_informes: boolean | null;
  indic_frec_informes: string;
  indic_link_informes: string;
  indic_fichas: boolean | null;
  indic_ficha_nombre: boolean | null;
  indic_ficha_metodo: boolean | null;
  indic_ficha_frec: boolean | null;
  indic_ficha_medio: boolean | null;
  indic_ficha_linea: boolean | null;
  indic_ficha_meta: boolean | null;

  // Sección 4 — Seguimiento y evaluación (max 25 pts)
  se_metod_cc: boolean | null;
  se_metod_fecha: string;
  se_metod_link: string;
  eval_cons: boolean | null;
  eval_periodo: number | '';
  eval_pea: boolean | null;
  eval_informes: boolean | null;
  eval_link_infor: string;
  eval_metod: string;
  eval_hallazgos: string;
  eval_estrateg: string;
  eval_ruta: string;
}

export interface BloqueKData {
  puntaje: number;
  puntaje_impl: number;
  puntaje_indic: number;
  puntaje_sye: number;
  nivel: NivelConsolidacion;
}

export interface BloqueLData {
  experiencias: string;
  notas: string;
}

export interface FormData {
  bloque_a: BloqueAData;
  bloque_b: BloqueBData;
  bloque_e: BloqueEData;
  bloque_f: BloqueFData;
  bloque_g: BloqueGData;
  bloque_h: BloqueHData;
  bloque_i: BloqueIData;
  bloque_j: BloqueJData;
  bloque_l: BloqueLData;
  // Secciones que el reportero ya revisó/confirmó en este período. Solo se
  // rastrea cuando el reporte se sembró arrastrando las respuestas del período
  // anterior: hasta que cada sección se confirma no cuenta como completa, para
  // que un reporte heredado no aparezca terminado sin revisión. `undefined` en
  // reportes capturados de cero o previos al rasgo: se deriva como siempre.
  revisados?: BloqueKey[];
}

export interface MockReport {
  estadoId: string;
  periodoId: string;
  status: ReportStatus;
  progreso: number;
  ultimo_guardado: string | null;
  fecha_envio: string | null;
  updated_at?: string | null; // versión optimista; ausente en datos mock
  bloqueStatuses: Record<string, BloqueStatus>;
  formData: FormData;
  comentarios_admin: string;
}

export type BloqueKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';

export interface BloqueInfo {
  key: BloqueKey;
  titulo: string;
  descripcion: string;
  // Etiqueta mostrada en la UI cuando difiere de `key` (p. ej. 'I' → 'H.1').
  displayKey?: string;
}
