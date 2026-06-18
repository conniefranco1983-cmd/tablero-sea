import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { BloqueJData } from '../../types';
import { calcularConsolidacion } from '../../lib/scoring';

interface Props {
  bloqueJ: BloqueJData;
}

const NIVEL_CONFIG = {
  Alto:  { classes: 'bg-guinda-800 border-guinda-700 text-white',       icon: TrendingUp,   bar: 'bg-guinda-200' },
  Medio: { classes: 'bg-guinda-100 border-guinda-200 text-guinda-900',  icon: Minus,        bar: 'bg-guinda-500' },
  Bajo:  { classes: 'bg-guinda-50 border-guinda-100 text-guinda-700',   icon: TrendingDown, bar: 'bg-guinda-300' },
};

const SECCIONES = [
  {
    key: 'impl' as const,
    label: 'Implementación (PI-PEA, seguimiento y presupuesto)',
    max: 67.5,
    criterios: [
      { label: 'PI-PEA aprobado por el Comité Coordinador',                    pts: 25,  campo: 'pipea_aprobado' as keyof BloqueJData,     cumple: (j: BloqueJData) => j.pipea_aprobado === true },
      { label: 'PI-PEA en ejecución',                                           pts: 25,  campo: 'pipea_ejec' as keyof BloqueJData,          cumple: (j: BloqueJData) => j.pipea_ejec === 'en_ejecucion' },
      { label: 'Mecanismo de seguimiento a la implementación',                  pts: 2.5, campo: 'impl_mec_seg' as keyof BloqueJData,        cumple: (j: BloqueJData) => j.impl_mec_seg === true },
      { label: 'Liga de la herramienta de seguimiento',                         pts: 2.5, campo: 'impl_link_mec_seg' as keyof BloqueJData,   cumple: (j: BloqueJData) => !!j.impl_link_mec_seg },
      { label: 'Informes de seguimiento a la implementación',                   pts: 2.5, campo: 'impl_informes_seg' as keyof BloqueJData,   cumple: (j: BloqueJData) => j.impl_informes_seg === true },
      { label: 'Liga de los informes de seguimiento',                           pts: 2.5, campo: 'impl_link_informes_seg' as keyof BloqueJData, cumple: (j: BloqueJData) => !!j.impl_link_informes_seg },
      { label: 'Informes presentados al Comité Coordinador',                    pts: 2.5, campo: 'impl_cc_informes_seg' as keyof BloqueJData, cumple: (j: BloqueJData) => j.impl_cc_informes_seg === true },
      { label: 'Instrumento presupuestario o herramienta programática',         pts: 2.5, campo: 'presup_inst' as keyof BloqueJData,         cumple: (j: BloqueJData) => j.presup_inst === true },
      { label: 'Metodología para etiquetar el recurso anticorrupción',          pts: 2.5, campo: 'presup_metod' as keyof BloqueJData,        cumple: (j: BloqueJData) => j.presup_metod === true },
    ],
  },
  {
    key: 'indic' as const,
    label: 'Indicadores',
    max: 7.5,
    criterios: [
      { label: 'Indicadores aprobados por el Comité Coordinador',               pts: 2.5, campo: 'indic_cc' as keyof BloqueJData,       cumple: (j: BloqueJData) => j.indic_cc === true },
      { label: 'Informes sobre el resultado de los indicadores',                pts: 2.5, campo: 'indic_informes' as keyof BloqueJData, cumple: (j: BloqueJData) => j.indic_informes === true },
      { label: 'Fichas de diseño de los indicadores',                           pts: 2.5, campo: 'indic_fichas' as keyof BloqueJData,   cumple: (j: BloqueJData) => j.indic_fichas === true },
    ],
  },
  {
    key: 'sye' as const,
    label: 'Seguimiento y evaluación de la PEA',
    max: 25,
    criterios: [
      { label: 'Cuenta con metodologías de seguimiento y evaluación aprobadas',  pts: 5, campo: 'se_metod_cc' as keyof BloqueJData,    cumple: (j: BloqueJData) => j.se_metod_cc === true },
      { label: 'Informe de la evaluación disponible',                           pts: 5, campo: 'eval_informes' as keyof BloqueJData,  cumple: (j: BloqueJData) => j.eval_informes === true },
      { label: 'Liga de la metodología de evaluación',                          pts: 5, campo: 'eval_metod' as keyof BloqueJData,     cumple: (j: BloqueJData) => !!j.eval_metod },
      { label: 'Estrategias implementadas a partir de la evaluación',           pts: 5, campo: 'eval_estrateg' as keyof BloqueJData,  cumple: (j: BloqueJData) => !!j.eval_estrateg },
      { label: 'Ruta definida a partir de los resultados de la evaluación',     pts: 5, campo: 'eval_ruta' as keyof BloqueJData,      cumple: (j: BloqueJData) => !!j.eval_ruta },
    ],
  },
];

function SubSeccionBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <p className="text-xs text-gray-600 font-medium">{label}</p>
        <span className="text-xs text-gray-500">{score} / {max} pts</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-guinda-700 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function BloqueK({ bloqueJ }: Props) {
  const { puntaje, puntaje_impl, puntaje_indic, puntaje_sye, nivel } = calcularConsolidacion(bloqueJ);
  const cfg = NIVEL_CONFIG[nivel];
  const Icon = cfg.icon;

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
        <p className="text-xs text-blue-700">
          Este bloque se calcula automáticamente a partir de las respuestas del <strong>Bloque H</strong>. No requiere captura manual.
        </p>
      </div>

      {/* Resultado principal */}
      <div className={`card p-6 border ${cfg.classes}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Nivel de consolidación</p>
            <div className="flex items-center gap-3">
              <Icon size={28} />
              <span className="text-3xl font-bold">{nivel}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Puntaje total</p>
            <span className="text-5xl font-bold">{puntaje}</span>
            <span className="text-lg font-medium opacity-60"> / 100</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-3 bg-black/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
              style={{ width: `${puntaje}%` }}
            />
          </div>
        </div>
      </div>

      {/* Desglose por subsección */}
      <div className="card p-5 space-y-3">
        <p className="text-sm font-semibold text-gray-700 mb-2">Puntaje por sección</p>
        <SubSeccionBar label="Implementación (PI-PEA, seguimiento y presupuesto)" score={puntaje_impl} max={67.5} />
        <SubSeccionBar label="Indicadores" score={puntaje_indic} max={7.5} />
        <SubSeccionBar label="Seguimiento y evaluación de la PEA" score={puntaje_sye} max={25} />
      </div>

      {/* Desglose por criterio */}
      {SECCIONES.map(sec => {
        const secScore = sec.key === 'impl' ? puntaje_impl : sec.key === 'indic' ? puntaje_indic : puntaje_sye;
        return (
          <div key={sec.key} className="card">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <p className="text-sm font-semibold text-gray-700">{sec.label}</p>
              <span className="text-sm font-bold text-gray-600">{secScore} / {sec.max}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {sec.criterios.map(c => {
                const cumple = c.cumple(bloqueJ);
                const noContesta = bloqueJ[c.campo] === null || bloqueJ[c.campo] === undefined ||
                  (typeof bloqueJ[c.campo] === 'string' && bloqueJ[c.campo] === '');
                return (
                  <div key={String(c.campo)} className="px-5 py-3 flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      noContesta ? 'bg-gray-100 text-gray-400' :
                      cumple     ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {noContesta ? '?' : cumple ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-700">{c.label}</p>
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${cumple ? 'text-green-700' : 'text-gray-300'}`}>
                      +{cumple ? c.pts : 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Interpretación de niveles */}
      <div className="card p-5 bg-gray-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Interpretación de niveles</p>
        <div className="space-y-2">
          {([['Alto', 'bg-guinda-800', 'text-guinda-900', '75 – 100 pts.'], ['Medio', 'bg-guinda-400', 'text-guinda-700', '25 – 74 pts.'], ['Bajo', 'bg-guinda-200', 'text-guinda-500', '0 – 24 pts.']] as const).map(([lbl, bar, txt, rng]) => (
            <div key={lbl} className="flex items-center gap-3">
              <span className={`w-16 text-xs font-medium ${txt} text-right`}>{lbl}</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${bar} rounded-full`} style={{ width: lbl === 'Alto' ? '87%' : lbl === 'Medio' ? '50%' : '12%' }} />
              </div>
              <span className="text-xs text-gray-500 w-24">{rng}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
