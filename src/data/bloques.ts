import type { BloqueInfo } from '../types';

// Nota: las secciones de designaciones (antes B "por ley", C "pendientes" y
// D "vigentes") se fusionaron en una sola sección B "Designaciones". El resto
// de las secciones se recorrió para mantener una secuencia continua A–J.
export const BLOQUES: BloqueInfo[] = [
  { key: 'A', titulo: 'Identificación de la entidad',       descripcion: 'Datos generales del estado y período de reporte' },
  { key: 'B', titulo: 'Designaciones',                      descripcion: 'Vigencia de las designaciones contempladas por ley' },
  { key: 'C', titulo: 'Actividad de los órganos colegiados', descripcion: 'Última sesión celebrada y sesiones programadas 2026' },
  { key: 'D', titulo: 'Presupuesto',                        descripcion: 'Presupuesto SESEA 2023–2026 y desglose por capítulos' },
  { key: 'E', titulo: 'Estructura de plazas',               descripcion: 'Distribución de plazas por área funcional' },
  { key: 'F', titulo: 'Capacitación',                       descripcion: 'Plataforma, cursos vigentes y servidores capacitados' },
  { key: 'G', titulo: 'Cambios normativos',                 descripcion: 'Modificaciones a la normatividad del Sistema Estatal Anticorrupción' },
  { key: 'H', titulo: 'Avances en la implementación',       descripcion: 'PIPEA, mecanismos, indicadores y evaluación' },
  { key: 'I', titulo: 'Grado de consolidación: resultados', descripcion: 'Puntaje y nivel derivados del Bloque H (solo lectura)', displayKey: 'H.1' },
  { key: 'J', titulo: 'Experiencias subnacionales y notas', descripcion: 'Texto libre sobre avances, retos y observaciones' },
];

// La sección de consolidación (I / "H.1") es solo para administradores: se deriva
// del Bloque H y no se muestra en las pantallas del reportero.
export const BLOQUES_REPORTERO: BloqueInfo[] = BLOQUES.filter(b => b.key !== 'I');
