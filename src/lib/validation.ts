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

// ── Validación de formato de campos ──
// La validación nativa de HTML5 (type="email"/"url") es inconsistente entre
// navegadores, así que validamos también en JS. Estas funciones devuelven el
// mensaje de error o `undefined` si el valor es válido. El valor vacío se trata
// como válido aquí; la obligatoriedad la maneja el atributo `required`.

// Local @ dominio . TLD (sin espacios, con al menos un punto en el dominio).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarCorreo(value: string): string | undefined {
  const v = value.trim();
  if (v === '') return undefined;
  return EMAIL_RE.test(v) ? undefined : 'Ingrese un correo electrónico válido (ejemplo: nombre@dominio.com).';
}

export function validarUrl(value: string): string | undefined {
  const v = value.trim();
  if (v === '') return undefined;
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return 'Ingrese una liga válida (ejemplo: https://dominio.com).';
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return 'La liga debe iniciar con http:// o https://.';
  }
  if (!url.hostname.includes('.')) {
    return 'Ingrese una liga válida (ejemplo: https://dominio.com).';
  }
  return undefined;
}

// Quita todo lo que no sea dígito; se usa para restringir la captura del teléfono.
export function soloDigitos(value: string): string {
  return value.replace(/\D/g, '');
}

export function validarTelefono(value: string): string | undefined {
  const v = value.trim();
  if (v === '') return undefined;
  if (!/^\d+$/.test(v)) return 'El teléfono solo debe contener números.';
  if (v.length !== 10) return 'El teléfono debe tener 10 dígitos.';
  return undefined;
}
