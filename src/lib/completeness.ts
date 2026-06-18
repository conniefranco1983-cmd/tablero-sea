import type {
  FormData,
  BloqueKey,
  BloqueStatus,
  BloqueBData,
  BloqueEData,
  BloqueFData,
  BloqueGData,
  BloqueHData,
  BloqueIData,
  BloqueJData,
} from '../types';
import { ORGANOS, type EstructuraEstado } from '../data/estructura';
import { validarSumaCapitulos } from './validation';

// Bloques que cuentan para la barra de progreso. Se excluyen A (auto-llenada),
// I (derivada/solo lectura) y J (texto libre): las tres están siempre completas,
// así que un formulario vacío marca 0% y solo cuentan las secciones capturables.
export const APLICABLES: BloqueKey[] = ['B', 'C', 'D', 'E', 'F', 'G', 'H'];

// Un campo está "lleno" cuando: booleans/toggles !== null; texto/select/fecha/url
// !== ''; número/dinero !== '' (un 0 capturado cuenta).
const filled = (v: unknown): boolean => v !== null && v !== undefined && v !== '';

// `req` = el conjunto de campos requeridos ya resueltos los condicionales.
// completo si `req` está vacío o todos llenos (y, para D, la suma cuadra);
// no_iniciado si ninguno lleno; en otro caso incompleto.
function statusFor(req: unknown[], extraValid = true): BloqueStatus {
  if (req.length === 0) return 'completo';
  const n = req.filter(filled).length;
  if (n === 0) return 'no_iniciado';
  if (n === req.length && extraValid) return 'completo';
  return 'incompleto';
}

// B — Designaciones: por cada órgano aplicable (estructura > 0) se exige
// `vigente` de cada asiento contemplado por ley; si vigente === true, todos sus
// datos. Sin órganos aplicables (todo 0) no hay requeridos → completo.
function reqB(data: BloqueBData, est: EstructuraEstado): unknown[] {
  const req: unknown[] = [];
  for (const { key } of ORGANOS) {
    if (est[key] <= 0) continue;
    const seats = data.designaciones?.[key] ?? [];
    for (let i = 0; i < est[key]; i++) {
      const seat = seats[i];
      req.push(seat ? seat.vigente : null);
      if (seat && seat.vigente === true) {
        req.push(
          seat.fecha_designacion, seat.fecha_termino, seat.nombre,
          seat.apellido_paterno, seat.apellido_materno, seat.cargo,
          seat.institucion, seat.correo,
        );
      }
    }
  }
  return req;
}

// C — Actividad de los órganos: CE siempre; CC/CRSF según estructura.
function reqC(data: BloqueEData, est: EstructuraEstado): unknown[] {
  const req: unknown[] = [data.integrantes_suficientes];
  req.push(data.ult_sesion_ce, data.sesiones_prog_ce_2026);
  if (est.cc > 0) req.push(data.ult_sesion_cc, data.sesiones_prog_cc_2026);
  if (est.crsf > 0) req.push(data.ult_sesion_crsf, data.sesiones_prog_crsf_2026);
  if (data.integrantes_suficientes === false) {
    req.push(data.cuerpos_no_sesionan.length > 0 ? 'x' : '');
  }
  return req;
}

// D — Presupuesto (la validación cruzada de capítulos se aplica aparte).
function reqD(data: BloqueFData): unknown[] {
  return [
    data.presupuesto_2023, data.presupuesto_2024, data.presupuesto_2025, data.presupuesto_2026,
    data.presupuesto_cpc_2026, data.contratos_vig_cpc_2026, data.honorarios_pdte_distintos,
    data.cap_1000, data.cap_2000, data.cap_3000, data.cap_4000, data.cap_5000,
    data.cap_6000, data.cap_7000, data.cap_8000, data.cap_9000,
  ];
}

// E — Estructura de plazas.
function reqE(data: BloqueGData): unknown[] {
  return [
    data.plazas_politica_publica, data.plazas_plataforma_digital,
    data.plazas_juridico_admin, data.plazas_titular, data.plazas_otra,
  ];
}

// F — Capacitación.
function reqF(data: BloqueHData): unknown[] {
  const req: unknown[] = [data.tiene_plataforma];
  if (data.tiene_plataforma === true) {
    req.push(data.num_cursos_vigentes, data.num_servidores_capacitados, data.temas_cursos);
  }
  return req;
}

// G — Cambios normativos: cada ley exige `tuvo_cambios`; si true, descripción.
function reqG(data: BloqueIData): unknown[] {
  const leyes: (keyof BloqueIData)[] = [
    'constitucion', 'cpe', 'lfs', 'lea', 'loape', 'lofgl', 'lotjae', 'lrae',
  ];
  const req: unknown[] = [];
  for (const k of leyes) {
    req.push(data[k].tuvo_cambios);
    if (data[k].tuvo_cambios === true) req.push(data[k].descripcion);
  }
  return req;
}

// H — Avances en la implementación: toda pregunta visible es requerida
// (excepción deliberada a la regla de `required`). Sigue la visibilidad
// condicional exacta de BloqueJ.
function reqH(data: BloqueJData): unknown[] {
  const req: unknown[] = [];

  // §1 PI-PEA
  req.push(data.pipea_aprobado);
  if (data.pipea_aprobado === true) {
    req.push(data.pipea_fecha_aprob, data.pipea_ejec);
    if (data.pipea_ejec === 'en_ejecucion') req.push(data.pipea_fecha_inicio);
    else if (data.pipea_ejec === 'no_iniciado') req.push(data.pipea_fecha_prog);
    req.push(data.pipea_num_estrategias, data.pipea_num_lineas, data.pipea_elem_progr);
    if (data.pipea_elem_progr === true) req.push(data.pipea_elem_progr_desc);
    req.push(data.pipea_num_inst, data.pipea_inst_list);
  } else if (data.pipea_aprobado === false) {
    req.push(data.pipea_no_motivos, data.pipea_no_fecha_estim);
    if (data.pipea_no_fecha_estim === true) req.push(data.pipea_no_fecha);
  }

  // §2 Seguimiento — la sección se deshabilita cuando pipea_aprobado === false.
  if (data.pipea_aprobado !== false) {
    req.push(data.impl_mec_seg);
    if (data.impl_mec_seg === true) req.push(data.impl_link_mec_seg, data.impl_frec_recop);
    req.push(data.impl_informes_seg);
    if (data.impl_informes_seg === true) {
      req.push(data.impl_link_informes_seg, data.impl_cc_informes_seg, data.impl_num_informes_publ);
    }
  }

  // §3 Presupuesto
  req.push(data.presup_inst);
  if (data.presup_inst === true) {
    req.push(data.presup_monto_2026, data.presup_publ);
    if (data.presup_publ === true) req.push(data.presup_link_publ);
    req.push(data.presup_metod);
    if (data.presup_metod === true) req.push(data.presup_metod_link);
  }

  // §4 Indicadores
  req.push(data.indic_cc);
  if (data.indic_cc === true) {
    req.push(
      data.indic_num, data.indic_problem_corr, data.indic_obj_anti, data.indic_act_inst,
      data.indic_instr_vinc, data.indic_elem_progr, data.indic_ejes, data.indic_obj_esp,
      data.indic_prior, data.indic_estr, data.indic_lin_acc, data.indic_tipo_herr, data.indic_link_herr,
    );
  }
  req.push(data.indic_informes);
  if (data.indic_informes === true) req.push(data.indic_frec_informes, data.indic_link_informes);
  req.push(data.indic_fichas);
  if (data.indic_fichas === true) {
    req.push(
      data.indic_ficha_nombre, data.indic_ficha_metodo, data.indic_ficha_frec,
      data.indic_ficha_medio, data.indic_ficha_linea, data.indic_ficha_meta,
    );
  }

  // §5 Seguimiento y evaluación
  req.push(data.se_metod_cc);
  if (data.se_metod_cc === true) req.push(data.se_metod_fecha, data.se_metod_link);
  req.push(data.eval_cons);
  if (data.eval_cons === true) req.push(data.eval_periodo);
  req.push(data.eval_pea);
  if (data.eval_pea === true) {
    req.push(data.eval_informes);
    if (data.eval_informes === true) {
      req.push(data.eval_link_infor, data.eval_metod, data.eval_hallazgos);
    }
    req.push(data.eval_estrateg, data.eval_ruta);
  }

  return req;
}

export function deriveStatuses(
  formData: FormData,
  estructura: EstructuraEstado,
): { bloqueStatuses: Record<BloqueKey, BloqueStatus>; progreso: number } {
  // Reportes sembrados por arrastre traen `revisados`: una sección con datos
  // heredados no cuenta como completa hasta que el reportero la confirma. Sin
  // `revisados` (captura de cero o reporte previo al rasgo) no se aplica el gate.
  const revisados = formData.revisados;
  const gate = (key: BloqueKey, derived: BloqueStatus): BloqueStatus =>
    revisados && APLICABLES.includes(key) && !revisados.includes(key) ? 'incompleto' : derived;

  const bloqueStatuses: Record<BloqueKey, BloqueStatus> = {
    A: 'completo', // identificación: auto-llenada, sin requeridos capturables
    B: gate('B', statusFor(reqB(formData.bloque_b, estructura))),
    C: gate('C', statusFor(reqC(formData.bloque_e, estructura))),
    D: gate('D', statusFor(reqD(formData.bloque_f), validarSumaCapitulos(formData.bloque_f).length === 0)),
    E: gate('E', statusFor(reqE(formData.bloque_g))),
    F: gate('F', statusFor(reqF(formData.bloque_h))),
    G: gate('G', statusFor(reqG(formData.bloque_i))),
    H: gate('H', statusFor(reqH(formData.bloque_j))),
    I: 'completo', // consolidación: derivada/solo lectura, fuera del gate
    J: 'completo', // experiencias/notas: texto libre, no bloquea
  };

  const completados = APLICABLES.filter(k => bloqueStatuses[k] === 'completo').length;
  const progreso = Math.round((100 * completados) / APLICABLES.length);

  return { bloqueStatuses, progreso };
}
