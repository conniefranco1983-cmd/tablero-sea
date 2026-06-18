import type { OrganoKey } from '../types';

export interface OrganoInfo {
  key: OrganoKey;
  siglas: string;
  label: string;
}

// Órganos contemplados por la estructura del SEA. La columna "Titular de la SESEA"
// de la estructura corresponde al/la Titular de la Secretaría Ejecutiva (SESEA).
export const ORGANOS: OrganoInfo[] = [
  { key: 'cs',   siglas: 'CS',   label: 'Comisión de Selección' },
  { key: 'cpc',  siglas: 'CPC',  label: 'Comité de Participación Ciudadana' },
  { key: 'cc',   siglas: 'CC',   label: 'Comité Coordinador' },
  { key: 'crsf', siglas: 'CRSF', label: 'Comité Rector del Sistema de Fiscalización' },
  { key: 'st',   siglas: 'ST',   label: 'Titular de la SESEA' },
];

export type EstructuraEstado = Record<OrganoKey, number>;
export type EstructuraSEA = Record<string, EstructuraEstado>;

// Número de designaciones contempladas por ley, por entidad y órgano.
// Fuente: estructura_seas.csv. Un valor de 0 indica que el órgano no aplica.
export const ESTRUCTURA_SEA: EstructuraSEA = {
  AGS:   { cs: 9,  cpc: 5, cc: 17, crsf: 9,  st: 1 },
  BC:    { cs: 5,  cpc: 5, cc: 13, crsf: 9,  st: 1 },
  BCS:   { cs: 5,  cpc: 5, cc: 6,  crsf: 0,  st: 1 },
  CAM:   { cs: 9,  cpc: 5, cc: 6,  crsf: 0,  st: 1 },
  COAH:  { cs: 9,  cpc: 5, cc: 6,  crsf: 0,  st: 1 },
  COL:   { cs: 11, cpc: 5, cc: 6,  crsf: 0,  st: 1 },
  CHIS:  { cs: 7,  cpc: 5, cc: 6,  crsf: 0,  st: 1 },
  CHIH:  { cs: 9,  cpc: 5, cc: 7,  crsf: 0,  st: 1 },
  CDMX:  { cs: 9,  cpc: 5, cc: 9,  crsf: 3,  st: 1 },
  DUR:   { cs: 9,  cpc: 5, cc: 6,  crsf: 9,  st: 1 },
  GTO:   { cs: 9,  cpc: 5, cc: 12, crsf: 9,  st: 1 },
  GRO:   { cs: 5,  cpc: 5, cc: 7,  crsf: 4,  st: 1 },
  HID:   { cs: 9,  cpc: 5, cc: 13, crsf: 0,  st: 1 },
  JAL:   { cs: 9,  cpc: 5, cc: 6,  crsf: 8,  st: 1 },
  MEX:   { cs: 9,  cpc: 5, cc: 7,  crsf: 10, st: 1 },
  MICH:  { cs: 9,  cpc: 5, cc: 9,  crsf: 0,  st: 1 },
  MOR:   { cs: 9,  cpc: 5, cc: 7,  crsf: 7,  st: 1 },
  NAY:   { cs: 9,  cpc: 5, cc: 6,  crsf: 9,  st: 1 },
  NL:    { cs: 9,  cpc: 5, cc: 9,  crsf: 0,  st: 1 },
  // Oaxaca no aparece en la estructura de origen; se inicializa en 0 hasta su edición.
  OAX:   { cs: 0,  cpc: 0, cc: 0,  crsf: 0,  st: 0 },
  PUE:   { cs: 9,  cpc: 5, cc: 6,  crsf: 0,  st: 1 },
  QRO:   { cs: 9,  cpc: 5, cc: 7,  crsf: 0,  st: 1 },
  QROO:  { cs: 5,  cpc: 5, cc: 6,  crsf: 0,  st: 1 },
  SLP:   { cs: 5,  cpc: 5, cc: 7,  crsf: 9,  st: 1 },
  SIN:   { cs: 9,  cpc: 5, cc: 6,  crsf: 0,  st: 1 },
  SON:   { cs: 9,  cpc: 5, cc: 6,  crsf: 0,  st: 1 },
  TAB:   { cs: 0,  cpc: 5, cc: 7,  crsf: 0,  st: 1 },
  TAMPS: { cs: 9,  cpc: 5, cc: 6,  crsf: 0,  st: 1 },
  TLAX:  { cs: 0,  cpc: 5, cc: 6,  crsf: 0,  st: 1 },
  VER:   { cs: 9,  cpc: 5, cc: 6,  crsf: 9,  st: 1 },
  YUC:   { cs: 7,  cpc: 5, cc: 6,  crsf: 0,  st: 1 },
  ZAC:   { cs: 5,  cpc: 5, cc: 6,  crsf: 0,  st: 1 },
};

const ESTRUCTURA_VACIA: EstructuraEstado = { cs: 0, cpc: 0, cc: 0, crsf: 0, st: 0 };

export function getEstructura(estructura: EstructuraSEA, estadoId: string | undefined): EstructuraEstado {
  return (estadoId && estructura[estadoId]) || ESTRUCTURA_VACIA;
}
