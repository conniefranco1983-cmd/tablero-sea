import type { MockReport, FormData, ReportStatus, BloqueStatus, BloqueJData, BloqueBData, DesignacionSeat, OrganoKey } from '../types';
import { ESTADOS } from './estados';
import { ESTRUCTURA_SEA, getEstructura, ORGANOS } from './estructura';

const vacioNormativo = { tuvo_cambios: null, descripcion: '' };

// Genera las designaciones de una entidad con la longitud que marca su estructura.
// 'full' deja todas las designaciones vigentes con un nombre de ejemplo; el resto
// las deja sin confirmar.
function buildDesignaciones(estadoId: string, modo: 'full' | 'vacio'): BloqueBData {
  const est = getEstructura(ESTRUCTURA_SEA, estadoId);
  const designaciones = {} as Record<OrganoKey, DesignacionSeat[]>;
  for (const { key } of ORGANOS) {
    designaciones[key] = Array.from({ length: est[key] }, (_, i): DesignacionSeat => {
      const base: DesignacionSeat = {
        vigente: null,
        fecha_designacion: '',
        fecha_termino: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        cargo: '',
        institucion: '',
        telefono: '',
        correo: '',
      };
      return modo === 'full'
        ? { ...base, vigente: true, nombre: `Integrante ${i + 1}` }
        : base;
    });
  }
  return { designaciones };
}

function emptyBloqueJ(): BloqueJData {
  return {
    pipea_aprobado: null,
    pipea_no_motivos: '',
    pipea_no_fecha_estim: null,
    pipea_no_fecha: '',
    pipea_fecha_aprob: '',
    pipea_ejec: null,
    pipea_fecha_inicio: '',
    pipea_fecha_prog: '',
    pipea_num_estrategias: '',
    pipea_num_lineas: '',
    pipea_elem_progr: null,
    pipea_elem_progr_desc: '',
    pipea_num_inst: '',
    pipea_inst_list: '',
    impl_mec_seg: null,
    impl_link_mec_seg: '',
    impl_frec_recop: '',
    impl_informes_seg: null,
    impl_link_informes_seg: '',
    impl_cc_informes_seg: null,
    impl_num_informes_publ: '',
    presup_inst: null,
    presup_monto_2026: '',
    presup_publ: null,
    presup_link_publ: '',
    presup_metod: null,
    presup_metod_link: '',
    indic_cc: null,
    indic_num: '',
    indic_problem_corr: '',
    indic_obj_anti: '',
    indic_act_inst: '',
    indic_instr_vinc: '',
    indic_elem_progr: '',
    indic_ejes: '',
    indic_obj_esp: '',
    indic_prior: '',
    indic_estr: '',
    indic_lin_acc: '',
    indic_tipo_herr: '',
    indic_link_herr: '',
    indic_informes: null,
    indic_frec_informes: '',
    indic_link_informes: '',
    indic_fichas: null,
    indic_ficha_nombre: null,
    indic_ficha_metodo: null,
    indic_ficha_frec: null,
    indic_ficha_medio: null,
    indic_ficha_linea: null,
    indic_ficha_meta: null,
    se_metod_cc: null,
    se_metod_fecha: '',
    se_metod_link: '',
    eval_cons: null,
    eval_periodo: '',
    eval_pea: null,
    eval_informes: null,
    eval_link_infor: '',
    eval_metod: '',
    eval_hallazgos: '',
    eval_estrateg: '',
    eval_ruta: '',
  };
}

function buildFullFormData(estadoId: string, titular: string): FormData {
  const estado = ESTADOS.find(e => e.id === estadoId);
  const tieneCRSF = estado?.tieneCRSF ?? true;
  return {
    bloque_a: {
      entidad: ESTADOS.find(e => e.id === estadoId)?.nombre ?? estadoId,
      titular_sesea: titular,
      periodo: '2026-Q1',
    },
    bloque_b: buildDesignaciones(estadoId, 'full'),
    bloque_e: {
      ult_sesion_cc: '1_a_6_meses',
      ult_sesion_ce: '1_a_6_meses',
      ult_sesion_crsf: tieneCRSF ? '1_a_6_meses' : '',
      sesiones_prog_cc_2026: 4,
      sesiones_prog_ce_2026: 4,
      sesiones_prog_crsf_2026: tieneCRSF ? 4 : '',
      integrantes_suficientes: true,
      cuerpos_no_sesionan: ['Ninguno'],
    },
    bloque_f: {
      presupuesto_2023: 18500000,
      presupuesto_2024: 21300000,
      presupuesto_2025: 24700000,
      presupuesto_2026: 27500000,
      presupuesto_cpc_2026: 4200000,
      cap_1000: 19000000,
      cap_2000: 2500000,
      cap_3000: 4000000,
      cap_4000: 500000,
      cap_5000: 800000,
      cap_6000: 300000,
      cap_7000: 0,
      cap_8000: 0,
      cap_9000: 400000,
      honorarios_pdte_distintos: false,
      contratos_vig_cpc_2026: 5,
      partida_honorarios_cpc: '3000',
    },
    bloque_g: {
      plazas_politica_publica: 8,
      plazas_plataforma_digital: 4,
      plazas_juridico_admin: 6,
      plazas_titular: 3,
      plazas_otra: 2,
    },
    bloque_h: {
      tiene_plataforma: true,
      num_cursos_vigentes: 12,
      num_servidores_capacitados: 247,
      temas_cursos: 'Ética pública, responsabilidades administrativas, fiscalización y prevención de la corrupción.',
    },
    bloque_i: {
      constitucion: { tuvo_cambios: true,  descripcion: 'Se reformó el artículo 113 para fortalecer las atribuciones del Comité Coordinador.' },
      cpe:          { tuvo_cambios: false, descripcion: '' },
      lfs:          { tuvo_cambios: false, descripcion: '' },
      lea:          { tuvo_cambios: true,  descripcion: 'Se adicionaron disposiciones sobre el sistema de alertas de posibles actos de corrupción.' },
      loape:        { tuvo_cambios: false, descripcion: '' },
      lofgl:        { tuvo_cambios: false, descripcion: '' },
      lotjae:       { tuvo_cambios: false, descripcion: '' },
      lrae:         { tuvo_cambios: true,  descripcion: 'Se modificaron los plazos para la resolución de procedimientos administrativos de responsabilidades.' },
    },
    bloque_j: {
      pipea_aprobado: true,
      pipea_no_motivos: '',
      pipea_no_fecha_estim: null,
      pipea_no_fecha: '',
      pipea_fecha_aprob: '2026-01-02',
      pipea_ejec: 'en_ejecucion',
      pipea_fecha_inicio: '2026-01-02',
      pipea_fecha_prog: '',
      pipea_num_estrategias: 25,
      pipea_num_lineas: 48,
      pipea_elem_progr: false,
      pipea_elem_progr_desc: '',
      pipea_num_inst: 71,
      pipea_inst_list: '71 entes públicos estatales y municipales, así como el Comité de Participación Ciudadana.',
      impl_mec_seg: true,
      impl_link_mec_seg: 'https://sesea.gob.mx/seguimiento',
      impl_frec_recop: 'Anual',
      impl_informes_seg: true,
      impl_link_informes_seg: 'https://sesea.gob.mx/informes',
      impl_cc_informes_seg: true,
      impl_num_informes_publ: 1,
      presup_inst: true,
      presup_monto_2026: 5083213,
      presup_publ: true,
      presup_link_publ: 'https://periodicooficial.gob.mx/instrumento',
      presup_metod: false,
      presup_metod_link: '',
      indic_cc: true,
      indic_num: 145,
      indic_problem_corr: 4,
      indic_obj_anti: 4,
      indic_act_inst: 4,
      indic_instr_vinc: 'Metodologías de Seguimiento y Evaluación',
      indic_elem_progr: 'Eje, Objetivo, Prioridad, Estrategia',
      indic_ejes: 10,
      indic_obj_esp: 10,
      indic_prior: 125,
      indic_estr: 25,
      indic_lin_acc: 0,
      indic_tipo_herr: 'Plataforma digital',
      indic_link_herr: 'https://sesea.gob.mx/indicadores',
      indic_informes: true,
      indic_frec_informes: 'Anual',
      indic_link_informes: 'https://sesea.gob.mx/indicadores/informes',
      indic_fichas: true,
      indic_ficha_nombre: true,
      indic_ficha_metodo: true,
      indic_ficha_frec: true,
      indic_ficha_medio: true,
      indic_ficha_linea: true,
      indic_ficha_meta: false,
      se_metod_cc: true,
      se_metod_fecha: '2021-01-29',
      se_metod_link: 'https://sesea.gob.mx/metodologia',
      eval_cons: true,
      eval_periodo: 5,
      eval_pea: false,
      eval_informes: null,
      eval_link_infor: '',
      eval_metod: '',
      eval_hallazgos: '',
      eval_estrateg: '',
      eval_ruta: '',
    },
    bloque_l: {
      experiencias: 'Durante este trimestre se llevó a cabo el intercambio de experiencias con los sistemas de Jalisco y Nuevo León en materia de implementación de la Plataforma Digital Estatal. Se identificaron buenas prácticas en la interoperabilidad de datos.',
      notas: 'Se prevé la publicación del segundo Informe de Resultados del Sistema Local Anticorrupción en el mes de junio de 2026.',
    },
  };
}

function buildPartialFormData(estadoId: string, titular: string): FormData {
  return {
    bloque_a: {
      entidad: ESTADOS.find(e => e.id === estadoId)?.nombre ?? estadoId,
      titular_sesea: titular,
      periodo: '2026-Q1',
    },
    bloque_b: buildDesignaciones(estadoId, 'vacio'),
    bloque_e: {
      ult_sesion_cc: '1_a_6_meses',
      ult_sesion_ce: '',
      ult_sesion_crsf: '',
      sesiones_prog_cc_2026: 4,
      sesiones_prog_ce_2026: '',
      sesiones_prog_crsf_2026: '',
      integrantes_suficientes: null,
      cuerpos_no_sesionan: [],
    },
    bloque_f: {
      presupuesto_2023: 15000000,
      presupuesto_2024: 17500000,
      presupuesto_2025: '',
      presupuesto_2026: '',
      presupuesto_cpc_2026: '',
      cap_1000: '',
      cap_2000: '',
      cap_3000: '',
      cap_4000: '',
      cap_5000: '',
      cap_6000: '',
      cap_7000: '',
      cap_8000: '',
      cap_9000: '',
      honorarios_pdte_distintos: null,
      contratos_vig_cpc_2026: '',
      partida_honorarios_cpc: '',
    },
    bloque_g: {
      plazas_politica_publica: '',
      plazas_plataforma_digital: '',
      plazas_juridico_admin: '',
      plazas_titular: '',
      plazas_otra: '',
    },
    bloque_h: {
      tiene_plataforma: null,
      num_cursos_vigentes: '',
      num_servidores_capacitados: '',
      temas_cursos: '',
    },
    bloque_i: {
      constitucion: vacioNormativo,
      cpe: vacioNormativo,
      lfs: vacioNormativo,
      lea: vacioNormativo,
      loape: vacioNormativo,
      lofgl: vacioNormativo,
      lotjae: vacioNormativo,
      lrae: vacioNormativo,
    },
    bloque_j: emptyBloqueJ(),
    bloque_l: {
      experiencias: '',
      notas: '',
    },
  };
}

export function emptyFormData(estadoId: string, titular: string, periodo = '2026-Q1'): FormData {
  return {
    bloque_a: {
      entidad: ESTADOS.find(e => e.id === estadoId)?.nombre ?? estadoId,
      titular_sesea: titular,
      periodo,
    },
    bloque_b: buildDesignaciones(estadoId, 'vacio'),
    bloque_e: { ult_sesion_cc: '', ult_sesion_ce: '', ult_sesion_crsf: '', sesiones_prog_cc_2026: '', sesiones_prog_ce_2026: '', sesiones_prog_crsf_2026: '', integrantes_suficientes: null, cuerpos_no_sesionan: [] },
    bloque_f: { presupuesto_2023: '', presupuesto_2024: '', presupuesto_2025: '', presupuesto_2026: '', presupuesto_cpc_2026: '', cap_1000: '', cap_2000: '', cap_3000: '', cap_4000: '', cap_5000: '', cap_6000: '', cap_7000: '', cap_8000: '', cap_9000: '', honorarios_pdte_distintos: null, contratos_vig_cpc_2026: '', partida_honorarios_cpc: '' },
    bloque_g: { plazas_politica_publica: '', plazas_plataforma_digital: '', plazas_juridico_admin: '', plazas_titular: '', plazas_otra: '' },
    bloque_h: { tiene_plataforma: null, num_cursos_vigentes: '', num_servidores_capacitados: '', temas_cursos: '' },
    bloque_i: { constitucion: vacioNormativo, cpe: vacioNormativo, lfs: vacioNormativo, lea: vacioNormativo, loape: vacioNormativo, lofgl: vacioNormativo, lotjae: vacioNormativo, lrae: vacioNormativo },
    bloque_j: emptyBloqueJ(),
    bloque_l: { experiencias: '', notas: '' },
  };
}

type ReportConfig = {
  status: ReportStatus;
  progreso: number;
  ultimo_guardado: string | null;
  fecha_envio: string | null;
  bloqueStatuses: Record<string, BloqueStatus>;
  comentarios_admin: string;
  dataType: 'full' | 'partial' | 'empty';
};

const CONFIGS: ReportConfig[] = [
  // enviados finales con acuse (5)
  { status: 'enviado', progreso: 100, ultimo_guardado: '2026-04-10T14:22:00', fecha_envio: '2026-04-10T14:22:00', bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'completo'}, comentarios_admin: 'Acuse generado por el tablero.', dataType: 'full' },
  { status: 'enviado', progreso: 100, ultimo_guardado: '2026-04-09T10:15:00', fecha_envio: '2026-04-09T10:15:00', bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'completo'}, comentarios_admin: 'Acuse generado por el tablero.', dataType: 'full' },
  { status: 'enviado', progreso: 100, ultimo_guardado: '2026-04-08T16:30:00', fecha_envio: '2026-04-08T16:30:00', bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'completo'}, comentarios_admin: 'Acuse generado por el tablero.', dataType: 'full' },
  { status: 'enviado', progreso: 100, ultimo_guardado: '2026-04-07T11:00:00', fecha_envio: '2026-04-07T11:00:00', bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'completo'}, comentarios_admin: 'Acuse generado por el tablero.', dataType: 'full' },
  { status: 'enviado', progreso: 100, ultimo_guardado: '2026-04-06T09:45:00', fecha_envio: '2026-04-06T09:45:00', bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'completo'}, comentarios_admin: 'Acuse generado por el tablero.', dataType: 'full' },
  // enviados (8)
  { status: 'enviado', progreso: 100, ultimo_guardado: '2026-04-14T17:55:00', fecha_envio: '2026-04-14T17:55:00', bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'completo'}, comentarios_admin: '', dataType: 'full' },
  { status: 'enviado', progreso: 100, ultimo_guardado: '2026-04-13T15:20:00', fecha_envio: '2026-04-13T15:20:00', bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'completo'}, comentarios_admin: '', dataType: 'full' },
  { status: 'enviado', progreso: 100, ultimo_guardado: '2026-04-12T13:10:00', fecha_envio: '2026-04-12T13:10:00', bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'completo'}, comentarios_admin: '', dataType: 'full' },
  { status: 'enviado', progreso: 100, ultimo_guardado: '2026-04-11T10:30:00', fecha_envio: '2026-04-11T10:30:00', bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'completo'}, comentarios_admin: '', dataType: 'full' },
  { status: 'enviado', progreso: 95,  ultimo_guardado: '2026-04-10T09:00:00', fecha_envio: '2026-04-10T09:00:00', bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'incompleto'}, comentarios_admin: '', dataType: 'full' },
  { status: 'enviado', progreso: 100, ultimo_guardado: '2026-04-09T16:45:00', fecha_envio: '2026-04-09T16:45:00', bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'completo'}, comentarios_admin: '', dataType: 'full' },
  { status: 'enviado', progreso: 100, ultimo_guardado: '2026-04-08T14:30:00', fecha_envio: '2026-04-08T14:30:00', bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'completo'}, comentarios_admin: '', dataType: 'full' },
  { status: 'enviado', progreso: 100, ultimo_guardado: '2026-04-07T12:15:00', fecha_envio: '2026-04-07T12:15:00', bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'completo'}, comentarios_admin: '', dataType: 'full' },
  // borradores (12)
  { status: 'borrador', progreso: 83, ultimo_guardado: '2026-04-14T11:00:00', fecha_envio: null, bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'incompleto',K:'incompleto',L:'no_iniciado'}, comentarios_admin: '', dataType: 'partial' },
  { status: 'borrador', progreso: 67, ultimo_guardado: '2026-04-13T09:30:00', fecha_envio: null, bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'incompleto',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'partial' },
  { status: 'borrador', progreso: 58, ultimo_guardado: '2026-04-12T14:00:00', fecha_envio: null, bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'incompleto',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'partial' },
  { status: 'borrador', progreso: 42, ultimo_guardado: '2026-04-11T16:30:00', fecha_envio: null, bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'incompleto',F:'no_iniciado',G:'no_iniciado',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'partial' },
  { status: 'borrador', progreso: 75, ultimo_guardado: '2026-04-14T10:15:00', fecha_envio: null, bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'incompleto',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'partial' },
  { status: 'borrador', progreso: 33, ultimo_guardado: '2026-04-08T09:00:00', fecha_envio: null, bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'incompleto',E:'no_iniciado',F:'no_iniciado',G:'no_iniciado',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'partial' },
  { status: 'borrador', progreso: 50, ultimo_guardado: '2026-04-10T13:45:00', fecha_envio: null, bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'incompleto',G:'no_iniciado',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'partial' },
  { status: 'borrador', progreso: 92, ultimo_guardado: '2026-04-14T15:00:00', fecha_envio: null, bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'completo',I:'completo',J:'completo',K:'completo',L:'incompleto'}, comentarios_admin: '', dataType: 'partial' },
  { status: 'borrador', progreso: 25, ultimo_guardado: '2026-04-05T10:00:00', fecha_envio: null, bloqueStatuses: {A:'completo',B:'completo',C:'incompleto',D:'no_iniciado',E:'no_iniciado',F:'no_iniciado',G:'no_iniciado',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'partial' },
  { status: 'borrador', progreso: 60, ultimo_guardado: '2026-04-12T11:30:00', fecha_envio: null, bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'incompleto',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'partial' },
  { status: 'borrador', progreso: 45, ultimo_guardado: '2026-04-09T14:20:00', fecha_envio: null, bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'incompleto',F:'incompleto',G:'no_iniciado',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'partial' },
  { status: 'borrador', progreso: 70, ultimo_guardado: '2026-04-13T16:00:00', fecha_envio: null, bloqueStatuses: {A:'completo',B:'completo',C:'completo',D:'completo',E:'completo',F:'completo',G:'completo',H:'incompleto',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'partial' },
  // sin_iniciar (7)
  { status: 'sin_iniciar', progreso: 0, ultimo_guardado: null, fecha_envio: null, bloqueStatuses: {A:'no_iniciado',B:'no_iniciado',C:'no_iniciado',D:'no_iniciado',E:'no_iniciado',F:'no_iniciado',G:'no_iniciado',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'empty' },
  { status: 'sin_iniciar', progreso: 0, ultimo_guardado: null, fecha_envio: null, bloqueStatuses: {A:'no_iniciado',B:'no_iniciado',C:'no_iniciado',D:'no_iniciado',E:'no_iniciado',F:'no_iniciado',G:'no_iniciado',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'empty' },
  { status: 'sin_iniciar', progreso: 0, ultimo_guardado: null, fecha_envio: null, bloqueStatuses: {A:'no_iniciado',B:'no_iniciado',C:'no_iniciado',D:'no_iniciado',E:'no_iniciado',F:'no_iniciado',G:'no_iniciado',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'empty' },
  { status: 'sin_iniciar', progreso: 0, ultimo_guardado: null, fecha_envio: null, bloqueStatuses: {A:'no_iniciado',B:'no_iniciado',C:'no_iniciado',D:'no_iniciado',E:'no_iniciado',F:'no_iniciado',G:'no_iniciado',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'empty' },
  { status: 'sin_iniciar', progreso: 0, ultimo_guardado: null, fecha_envio: null, bloqueStatuses: {A:'no_iniciado',B:'no_iniciado',C:'no_iniciado',D:'no_iniciado',E:'no_iniciado',F:'no_iniciado',G:'no_iniciado',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'empty' },
  { status: 'sin_iniciar', progreso: 0, ultimo_guardado: null, fecha_envio: null, bloqueStatuses: {A:'no_iniciado',B:'no_iniciado',C:'no_iniciado',D:'no_iniciado',E:'no_iniciado',F:'no_iniciado',G:'no_iniciado',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'empty' },
  { status: 'sin_iniciar', progreso: 0, ultimo_guardado: null, fecha_envio: null, bloqueStatuses: {A:'no_iniciado',B:'no_iniciado',C:'no_iniciado',D:'no_iniciado',E:'no_iniciado',F:'no_iniciado',G:'no_iniciado',H:'no_iniciado',I:'no_iniciado',J:'no_iniciado',K:'no_iniciado',L:'no_iniciado'}, comentarios_admin: '', dataType: 'empty' },
];

// Reasigna los estatus por bloque del esquema antiguo (A–L, con B/C/D separados)
// al nuevo esquema continuo (A–J, con designaciones fusionadas en B).
const STATUS_RANK: Record<BloqueStatus, number> = { no_iniciado: 0, incompleto: 1, completo: 2 };

function remapStatuses(s: Record<string, BloqueStatus>): Record<string, BloqueStatus> {
  const peor = (...xs: BloqueStatus[]): BloqueStatus =>
    xs.reduce((a, b) => (STATUS_RANK[a] <= STATUS_RANK[b] ? a : b));
  return {
    A: s.A,
    B: peor(s.B, s.C, s.D),
    C: s.E, D: s.F, E: s.G, F: s.H, G: s.I, H: s.J, I: s.K, J: s.L,
  };
}

export const MOCK_REPORTS: MockReport[] = ESTADOS.map((estado, idx) => {
  const cfg = CONFIGS[idx % CONFIGS.length];
  const formData =
    cfg.dataType === 'full'    ? buildFullFormData(estado.id, estado.titular) :
    cfg.dataType === 'partial' ? buildPartialFormData(estado.id, estado.titular) :
                                  emptyFormData(estado.id, estado.titular);
  return {
    estadoId: estado.id,
    periodoId: '2026-Q1',
    status: cfg.status,
    progreso: cfg.progreso,
    ultimo_guardado: cfg.ultimo_guardado,
    fecha_envio: cfg.fecha_envio,
    bloqueStatuses: remapStatuses(cfg.bloqueStatuses),
    formData,
    comentarios_admin: cfg.comentarios_admin,
  };
});

export function getReport(estadoId: string): MockReport | undefined {
  return MOCK_REPORTS.find(r => r.estadoId === estadoId);
}
