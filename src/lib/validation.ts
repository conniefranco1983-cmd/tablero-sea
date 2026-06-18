import type { BloqueFData } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validarSumaCapitulos(f: BloqueFData): ValidationError[] {
  if (f.presupuesto_2026 === '') return [];
  const caps: (number | '')[] = [f.cap_1000, f.cap_2000, f.cap_3000, f.cap_4000, f.cap_5000, f.cap_6000, f.cap_7000, f.cap_8000, f.cap_9000];
  const suma: number = caps.reduce((acc: number, c) => acc + (c === '' ? 0 : (c as number)), 0);
  const total: number = f.presupuesto_2026 as number;
  if (Math.abs(suma - total) > 1) {
    return [{
      field: 'bloque_f.capitulos',
      message: `La suma de los capítulos ($${suma.toLocaleString('es-MX')}) no coincide con el presupuesto 2026 ($${total.toLocaleString('es-MX')}). Diferencia: $${(Math.abs(suma - total)).toLocaleString('es-MX')}.`,
    }];
  }
  return [];
}

export function formatMXN(value: number | ''): string {
  if (value === '') return '';
  return Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
