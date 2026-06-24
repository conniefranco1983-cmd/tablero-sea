import { Toggle } from '../ui/Toggle';
import { TextInput, Textarea, NumberInput, UrlInput } from '../ui/Input';
import { Select } from '../ui/Select';
import { MoneyInput } from '../ui/MoneyInput';
import { MAX } from '../../lib/fieldLimits';
import type { BloqueJData } from '../../types';

interface Props {
  data: BloqueJData;
  onChange?: (patch: Partial<BloqueJData>) => void;
  readOnly?: boolean;
}

const PIPEA_EJEC_OPTIONS = [
  { value: 'en_ejecucion', label: 'En ejecución' },
  { value: 'no_iniciado',  label: 'No iniciado' },
];

// Escala de valoración 1–4 (restringe la captura a esos valores).
const ESCALA_1_4_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
];

function SectionHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="shrink-0 w-7 h-7 rounded-full bg-guinda-950 text-white text-xs font-bold flex items-center justify-center">
        {num}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
      </div>
    </div>
  );
}

export function BloqueJ({ data, onChange, readOnly }: Props) {
  const set = (patch: Partial<BloqueJData>) => !readOnly && onChange?.(patch);
  const seguimientoBloqueado = data.pipea_aprobado === false;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Las preguntas con interruptor (Sí/No) y las ligas alimentan automáticamente el puntaje del Bloque I. Los campos descriptivos y numéricos complementan el reporte sin afectar el puntaje.
      </p>

      {/* ── Sección 1: PI-PEA ── */}
      <div className="card p-5">
        <SectionHeader num={1} title="Programa de Implementación de la Política Estatal Anticorrupción (PI-PEA)" />
        <div className="space-y-4">
          <Toggle
            label="¿La entidad tiene Programa de Implementación de la Política Estatal Anticorrupción (PI PEA) aprobado por el Comité Coordinador?"
            value={data.pipea_aprobado}
            onChange={v => set({ pipea_aprobado: v })}
            required
            disabled={readOnly}
          />
          {data.pipea_aprobado === true && (
            <>
              <TextInput
                type="date"
                label="Fecha de aprobación del PI-PEA"
                value={data.pipea_fecha_aprob}
                onChange={e => set({ pipea_fecha_aprob: e.target.value })}
                readOnly={readOnly}
                required
              />
              <Select
                label="Estado de ejecución del PI-PEA"
                value={data.pipea_ejec ?? ''}
                onChange={e => set({ pipea_ejec: e.target.value as BloqueJData['pipea_ejec'] })}
                required
                disabled={readOnly}
                options={PIPEA_EJEC_OPTIONS}
                placeholder="Seleccione..."
              />
              {data.pipea_ejec === 'en_ejecucion' && (
                <TextInput
                  type="date"
                  label="Fecha de inicio de la ejecución"
                  value={data.pipea_fecha_inicio}
                  onChange={e => set({ pipea_fecha_inicio: e.target.value })}
                  readOnly={readOnly}
                  required
                  min={data.pipea_fecha_aprob || undefined}
                />
              )}
              {data.pipea_ejec === 'no_iniciado' && (
                <TextInput
                  type="date"
                  label="Fecha de inicio programada"
                  value={data.pipea_fecha_prog}
                  onChange={e => set({ pipea_fecha_prog: e.target.value })}
                  readOnly={readOnly}
                  required
                />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <NumberInput
                  label="Número de estrategias contempladas"
                  value={data.pipea_num_estrategias}
                  onChange={v => set({ pipea_num_estrategias: v })}
                  required
                  disabled={readOnly}
                  min={0}
                />
                <NumberInput
                  label="Número de líneas de acción contempladas"
                  value={data.pipea_num_lineas}
                  onChange={v => set({ pipea_num_lineas: v })}
                  required
                  disabled={readOnly}
                  min={0}
                />
              </div>
              <Toggle
                label="¿Se contempla algún elemento programático distinto (eje, prioridad, etc.)?"
                value={data.pipea_elem_progr}
                onChange={v => set({ pipea_elem_progr: v, pipea_elem_progr_desc: v ? data.pipea_elem_progr_desc : '' })}
                disabled={readOnly}
                required
              />
              {data.pipea_elem_progr === true && (
                <TextInput
                  label="Descripción del elemento programático"
                  value={data.pipea_elem_progr_desc}
                  onChange={e => set({ pipea_elem_progr_desc: e.target.value })}
                  readOnly={readOnly}
                  required
                  maxLength={MAX.textoLinea}
                />
              )}
              <NumberInput
                label="Número de instituciones participantes en la implementación"
                value={data.pipea_num_inst}
                onChange={v => set({ pipea_num_inst: v })}
                required
                disabled={readOnly}
                min={0}
              />
              <Textarea
                label="Instituciones participantes en la implementación"
                value={data.pipea_inst_list}
                onChange={e => set({ pipea_inst_list: e.target.value })}
                readOnly={readOnly}
                rows={3}
                placeholder="Liste las instituciones que participan en la implementación..."
                required
                maxLength={MAX.textoLibre}
              />
            </>
          )}
          {data.pipea_aprobado === false && (
            <>
              <Textarea
                label="Describa la situación actual que explique las razones que han dificultado la aprobación del PI-PEA"
                value={data.pipea_no_motivos}
                onChange={e => set({ pipea_no_motivos: e.target.value.slice(0, 800) })}
                readOnly={readOnly}
                required
                rows={4}
                maxLength={MAX.descripcion}
              />
              <Toggle
                label="¿Hay una fecha de aprobación estimada para la aprobación del PI-PEA?"
                value={data.pipea_no_fecha_estim}
                onChange={v => set({ pipea_no_fecha_estim: v, pipea_no_fecha: v ? data.pipea_no_fecha : '' })}
                required
                disabled={readOnly}
              />
              {data.pipea_no_fecha_estim === true && (
                <TextInput
                  type="date"
                  label="Fecha estimada de aprobación del PI-PEA"
                  value={data.pipea_no_fecha}
                  onChange={e => set({ pipea_no_fecha: e.target.value })}
                  readOnly={readOnly}
                  required
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Sección 2: Seguimiento a la implementación ── */}
      <div className={`card p-5 ${seguimientoBloqueado ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <SectionHeader num={2} title="Seguimiento a la implementación" />
        <div className="space-y-5">

          <div className="space-y-3">
            <Toggle
              label="¿Existe un mecanismo para recopilar información sobre el seguimiento a la implementación?"
              value={data.impl_mec_seg}
              onChange={v => set({ impl_mec_seg: v })}
              required
              disabled={readOnly}
            />
            {data.impl_mec_seg === true && (
              <>
                <UrlInput
                  label="Liga de la herramienta de seguimiento a la implementación"
                  value={data.impl_link_mec_seg}
                  onChange={e => set({ impl_link_mec_seg: e.target.value })}
                  readOnly={readOnly}
                  placeholder="https://"
                  required
                />
                <TextInput
                  label="Frecuencia de recopilación de la información"
                  value={data.impl_frec_recop}
                  onChange={e => set({ impl_frec_recop: e.target.value })}
                  readOnly={readOnly}
                  placeholder="Ej. Trimestral, Anual..."
                  maxLength={MAX.textoLinea}
                  required
                />
              </>
            )}
          </div>

          <div className="space-y-3">
            <Toggle
              label="¿Se elaboran informes de seguimiento a la implementación?"
              value={data.impl_informes_seg}
              onChange={v => set({ impl_informes_seg: v })}
              required
              disabled={readOnly}
            />
            {data.impl_informes_seg === true && (
              <>
                <UrlInput
                  label="Liga de los informes de seguimiento a la implementación"
                  value={data.impl_link_informes_seg}
                  onChange={e => set({ impl_link_informes_seg: e.target.value })}
                  readOnly={readOnly}
                  placeholder="https://"
                  required
                />
                <Toggle
                  label="¿Los informes de seguimiento se presentan al Comité Coordinador del SEA?"
                  value={data.impl_cc_informes_seg}
                  onChange={v => set({ impl_cc_informes_seg: v })}
                  required
                  disabled={readOnly}
                />
                <NumberInput
                  label="Número de informes de seguimiento presentados al Comité Coordinador"
                  value={data.impl_num_informes_publ}
                  onChange={v => set({ impl_num_informes_publ: v })}
                  disabled={readOnly}
                  min={0}
                  required
                />
              </>
            )}
          </div>

        </div>
      </div>

      {/* ── Sección 3: Presupuesto anticorrupción ── */}
      <div className="card p-5">
        <SectionHeader num={3} title="Presupuesto anticorrupción" />
        <div className="space-y-3">
          <Toggle
            label="¿Se cuenta con algún instrumento presupuestario o herramienta programática para el seguimiento al gasto anticorrupción?"
            value={data.presup_inst}
            onChange={v => set({ presup_inst: v })}
            required
            disabled={readOnly}
          />
          {data.presup_inst === true && (
            <>
              <MoneyInput
                label="Monto asignado al instrumento presupuestario para 2026"
                value={data.presup_monto_2026}
                onChange={v => set({ presup_monto_2026: v })}
                readOnly={readOnly}
                required
              />
              <Toggle
                label="¿El instrumento presupuestario y el monto fueron publicados en el Periódico Oficial Estatal?"
                value={data.presup_publ}
                onChange={v => set({ presup_publ: v, presup_link_publ: v ? data.presup_link_publ : '' })}
                disabled={readOnly}
                required
              />
              {data.presup_publ === true && (
                <UrlInput
                  label="Liga de la publicación del instrumento presupuestario y el monto"
                  value={data.presup_link_publ}
                  onChange={e => set({ presup_link_publ: e.target.value })}
                  readOnly={readOnly}
                  placeholder="https://"
                  required
                />
              )}
              <Toggle
                label="¿Se cuenta con una metodología para etiquetar el recurso anticorrupción?"
                value={data.presup_metod}
                onChange={v => set({ presup_metod: v, presup_metod_link: v ? data.presup_metod_link : '' })}
                required
                disabled={readOnly}
              />
              {data.presup_metod === true && (
                <UrlInput
                  label="Liga de la metodología para etiquetar el recurso"
                  value={data.presup_metod_link}
                  onChange={e => set({ presup_metod_link: e.target.value })}
                  readOnly={readOnly}
                  placeholder="https://"
                  required
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Sección 4: Indicadores ── */}
      <div className="card p-5">
        <SectionHeader num={4} title="Indicadores" />
        <div className="space-y-4">
          <Toggle
            label="¿Se cuenta con indicadores aprobados por el Comité Coordinador?"
            value={data.indic_cc}
            onChange={v => set({ indic_cc: v })}
            required
            disabled={readOnly}
          />
          {data.indic_cc === true && (
            <>
              <NumberInput
                label="Número de indicadores aprobados"
                value={data.indic_num}
                onChange={v => set({ indic_num: v })}
                required
                disabled={readOnly}
                min={0}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Select
                  label="¿En qué medida miden el problema de la corrupción?"
                  value={data.indic_problem_corr === '' ? '' : String(data.indic_problem_corr)}
                  onChange={e => set({ indic_problem_corr: e.target.value === '' ? '' : Number(e.target.value) })}
                  disabled={readOnly}
                  options={ESCALA_1_4_OPTIONS}
                  placeholder="Selecciona…"
                  required
                />
                <Select
                  label="¿En qué medida reflejan los objetivos anticorrupción?"
                  value={data.indic_obj_anti === '' ? '' : String(data.indic_obj_anti)}
                  onChange={e => set({ indic_obj_anti: e.target.value === '' ? '' : Number(e.target.value) })}
                  disabled={readOnly}
                  options={ESCALA_1_4_OPTIONS}
                  placeholder="Selecciona…"
                  required
                />
                <Select
                  label="¿En qué medida miden una actividad institucional?"
                  value={data.indic_act_inst === '' ? '' : String(data.indic_act_inst)}
                  onChange={e => set({ indic_act_inst: e.target.value === '' ? '' : Number(e.target.value) })}
                  disabled={readOnly}
                  options={ESCALA_1_4_OPTIONS}
                  placeholder="Selecciona…"
                  required
                />
              </div>
              <TextInput
                label="Instrumento(s) en que se incorporan los indicadores"
                value={data.indic_instr_vinc}
                onChange={e => set({ indic_instr_vinc: e.target.value })}
                readOnly={readOnly}
                placeholder="Ej. PEA, PI-PEA, Modelo de Seguimiento y Evaluación..."
                required
                maxLength={MAX.textoLinea}
              />
              <TextInput
                label="Elemento programático que miden los indicadores"
                value={data.indic_elem_progr}
                onChange={e => set({ indic_elem_progr: e.target.value })}
                readOnly={readOnly}
                placeholder="Ej. Eje, Objetivo, Prioridad, Estrategia, Línea de acción..."
                required
                maxLength={MAX.textoLinea}
              />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-1">Indicadores asociados por elemento</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <NumberInput label="Ejes" value={data.indic_ejes} onChange={v => set({ indic_ejes: v })} disabled={readOnly} min={0} required />
                <NumberInput label="Obj. específicos" value={data.indic_obj_esp} onChange={v => set({ indic_obj_esp: v })} disabled={readOnly} min={0} required />
                <NumberInput label="Prioridades" value={data.indic_prior} onChange={v => set({ indic_prior: v })} disabled={readOnly} min={0} required />
                <NumberInput label="Estrategias" value={data.indic_estr} onChange={v => set({ indic_estr: v })} disabled={readOnly} min={0} required />
                <NumberInput label="Líneas de acción" value={data.indic_lin_acc} onChange={v => set({ indic_lin_acc: v })} disabled={readOnly} min={0} required />
              </div>
              <TextInput
                label="Tipo de herramienta de seguimiento a los indicadores"
                value={data.indic_tipo_herr}
                onChange={e => set({ indic_tipo_herr: e.target.value })}
                readOnly={readOnly}
                placeholder="Ej. Plataforma digital, Base de datos, Fichas de seguimiento..."
                required
                maxLength={MAX.textoLinea}
              />
              <UrlInput
                label="Liga de la herramienta de seguimiento a los indicadores"
                value={data.indic_link_herr}
                onChange={e => set({ indic_link_herr: e.target.value })}
                readOnly={readOnly}
                placeholder="https://"
                required
              />
            </>
          )}
          <Toggle
            label="¿Se cuenta con informes sobre el resultado de los indicadores (distintos de los informes de seguimiento a la implementación)?"
            value={data.indic_informes}
            onChange={v => set({ indic_informes: v })}
            required
            disabled={readOnly}
          />
          {data.indic_informes === true && (
            <>
              <TextInput
                label="Frecuencia de emisión de los informes sobre el resultado de los indicadores"
                value={data.indic_frec_informes}
                onChange={e => set({ indic_frec_informes: e.target.value })}
                readOnly={readOnly}
                placeholder="Ej. Trimestral, Anual..."
                required
                maxLength={MAX.textoLinea}
              />
              <UrlInput
                label="Liga de los informes sobre el resultado de los indicadores"
                value={data.indic_link_informes}
                onChange={e => set({ indic_link_informes: e.target.value })}
                readOnly={readOnly}
                placeholder="https://"
                required
              />
            </>
          )}
          <Toggle
            label="¿Los indicadores cuentan con fichas de diseño?"
            value={data.indic_fichas}
            onChange={v => set({ indic_fichas: v })}
            required
            disabled={readOnly}
          />
          {data.indic_fichas === true && (
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-4 space-y-3">
              <p className="text-xs font-medium text-gray-600">Elementos que incorporan las fichas de diseño</p>
              <Toggle label="Nombre del indicador" value={data.indic_ficha_nombre} onChange={v => set({ indic_ficha_nombre: v })} disabled={readOnly} required />
              <Toggle label="Método de cálculo (fórmula)" value={data.indic_ficha_metodo} onChange={v => set({ indic_ficha_metodo: v })} disabled={readOnly} required />
              <Toggle label="Frecuencia de medición" value={data.indic_ficha_frec} onChange={v => set({ indic_ficha_frec: v })} disabled={readOnly} required />
              <Toggle label="Medio de verificación" value={data.indic_ficha_medio} onChange={v => set({ indic_ficha_medio: v })} disabled={readOnly} required />
              <Toggle label="Línea base" value={data.indic_ficha_linea} onChange={v => set({ indic_ficha_linea: v })} disabled={readOnly} required />
              <Toggle label="Meta" value={data.indic_ficha_meta} onChange={v => set({ indic_ficha_meta: v })} disabled={readOnly} required />
            </div>
          )}
        </div>
      </div>

      {/* ── Sección 5: Seguimiento y evaluación ── */}
      <div className="card p-5">
        <SectionHeader num={5} title="Seguimiento y evaluación de la PEA" />
        <div className="space-y-4">
          <Toggle
            label="¿Cuenta con metodologías de seguimiento y evaluación aprobadas por el Comité Coordinador?"
            value={data.se_metod_cc}
            onChange={v => set({ se_metod_cc: v, se_metod_fecha: v ? data.se_metod_fecha : '', se_metod_link: v ? data.se_metod_link : '' })}
            disabled={readOnly}
            required
          />
          {data.se_metod_cc === true && (
            <>
              <TextInput
                type="date"
                label="Fecha de aprobación de la metodología"
                value={data.se_metod_fecha}
                onChange={e => set({ se_metod_fecha: e.target.value })}
                readOnly={readOnly}
                required
              />
              <UrlInput
                label="Liga de la metodología de seguimiento y evaluación"
                value={data.se_metod_link}
                onChange={e => set({ se_metod_link: e.target.value })}
                readOnly={readOnly}
                placeholder="https://"
                required
              />
            </>
          )}

          <Toggle
            label="¿En alguno de sus instrumentos de política pública se contempla la realización de una evaluación?"
            value={data.eval_cons}
            onChange={v => set({ eval_cons: v, eval_periodo: v ? data.eval_periodo : '' })}
            disabled={readOnly}
            required
          />
          {data.eval_cons === true && (
            <NumberInput
              label="Años tras el inicio de la implementación previstos para la evaluación"
              value={data.eval_periodo}
              onChange={v => set({ eval_periodo: v })}
              disabled={readOnly}
              min={0}
              required
            />
          )}

          <Toggle
            label="¿Se han llevado a cabo evaluaciones a la Política Estatal Anticorrupción (PEA) o a su implementación?"
            value={data.eval_pea}
            onChange={v => set({ eval_pea: v })}
            required
            disabled={readOnly}
          />
          {data.eval_pea === true && (
            <>
              <Toggle
                label="¿Se cuenta con un informe de la evaluación?"
                value={data.eval_informes}
                onChange={v => set({ eval_informes: v })}
                required
                disabled={readOnly}
              />
              {data.eval_informes === true && (
                <>
                  <UrlInput
                    label="Liga del informe de la evaluación"
                    value={data.eval_link_infor}
                    onChange={e => set({ eval_link_infor: e.target.value })}
                    readOnly={readOnly}
                    placeholder="https://"
                    required
                  />
                  <UrlInput
                    label="Liga de la metodología utilizada para la evaluación"
                    value={data.eval_metod}
                    onChange={e => set({ eval_metod: e.target.value })}
                    readOnly={readOnly}
                    placeholder="https://"
                    required
                  />
                  <Textarea
                    label="Principales hallazgos derivados de la evaluación"
                    value={data.eval_hallazgos}
                    onChange={e => set({ eval_hallazgos: e.target.value })}
                    readOnly={readOnly}
                    rows={3}
                    placeholder="Indique los tres principales hallazgos derivados de la evaluación..."
                    required
                    maxLength={MAX.evaluacion}
                  />
                </>
              )}
            </>
          )}
          {data.eval_pea === true && (
            <>
              <Textarea
                label="Estrategias o instrumentos implementados a partir de los resultados de la evaluación"
                value={data.eval_estrateg}
                onChange={e => set({ eval_estrateg: e.target.value })}
                readOnly={readOnly}
                required
                rows={3}
                placeholder="Describa las estrategias implementadas a partir de la evaluación."
                maxLength={MAX.evaluacion}
              />
              <Textarea
                label="Ruta por seguir a partir de los resultados de la evaluación"
                value={data.eval_ruta}
                onChange={e => set({ eval_ruta: e.target.value })}
                readOnly={readOnly}
                required
                rows={3}
                placeholder="Describa la ruta definida a partir de la evaluación."
                maxLength={MAX.evaluacion}
              />
            </>
          )}
        </div>
      </div>

    </div>
  );
}
