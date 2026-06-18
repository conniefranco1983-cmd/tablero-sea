import { describe, it, expect } from 'vitest';
import { deriveStatuses } from './completeness';
import { MOCK_REPORTS } from '../data/mockReports';
import { ESTRUCTURA_SEA, ORGANOS } from '../data/estructura';
import type { DesignacionSeat, OrganoKey } from '../types';

// Reporte sin iniciar con al menos un órgano contemplado (B/C son evaluables).
const emptyReport = MOCK_REPORTS.find(
  r => r.status === 'sin_iniciar' && ESTRUCTURA_SEA[r.estadoId].cc > 0,
)!;
const emptyEst = ESTRUCTURA_SEA[emptyReport.estadoId];

describe('deriveStatuses', () => {
  it('formData vacío → solo A/J completas, el resto no_iniciado', () => {
    const { bloqueStatuses, progreso } = deriveStatuses(emptyReport.formData, emptyEst);
    expect(bloqueStatuses).toMatchObject({
      A: 'completo',
      B: 'no_iniciado',
      C: 'no_iniciado',
      D: 'no_iniciado',
      E: 'no_iniciado',
      F: 'no_iniciado',
      G: 'no_iniciado',
      H: 'no_iniciado',
      I: 'completo',
      J: 'completo',
    });
    // Ninguna sección capturable está completa → 0% (A/I/J quedan fuera).
    expect(progreso).toBe(0);
  });

  it('formData completo → todas completas y 100%', () => {
    // El mock "full" llena todo salvo los datos de cada designación (solo deja
    // nombre + vigente), así que reconstruimos B con asientos completos.
    const base = MOCK_REPORTS.find(r => r.estadoId === 'AGS')!.formData;
    const est = ESTRUCTURA_SEA['AGS'];
    const fullSeat: DesignacionSeat = {
      vigente: true,
      fecha_designacion: '2026-01-01',
      fecha_termino: '2027-01-01',
      nombre: 'Nombre',
      apellido_paterno: 'Paterno',
      apellido_materno: 'Materno',
      cargo: 'Cargo',
      institucion: 'Institución',
      telefono: '5551234567',
      correo: 'persona@ejemplo.mx',
    };
    const designaciones = {} as Record<OrganoKey, DesignacionSeat[]>;
    for (const { key } of ORGANOS) {
      designaciones[key] = Array.from({ length: est[key] }, () => ({ ...fullSeat }));
    }
    const complete = { ...base, bloque_b: { designaciones } };

    const { bloqueStatuses, progreso } = deriveStatuses(complete, est);
    expect(Object.values(bloqueStatuses).every(s => s === 'completo')).toBe(true);
    expect(progreso).toBe(100);
  });

  it('parcial → E completa, F incompleta, progreso a mano', () => {
    const partial = {
      ...emptyReport.formData,
      bloque_g: {
        plazas_politica_publica: 1,
        plazas_plataforma_digital: 2,
        plazas_juridico_admin: 3,
        plazas_titular: 4,
        plazas_otra: 5,
      },
      bloque_h: { ...emptyReport.formData.bloque_h, tiene_plataforma: true },
    };
    const { bloqueStatuses, progreso } = deriveStatuses(partial, emptyEst);
    expect(bloqueStatuses.E).toBe('completo');
    expect(bloqueStatuses.F).toBe('incompleto');
    expect(bloqueStatuses.B).toBe('no_iniciado');
    // Completas entre las 7 secciones capturables: solo E → 1.
    expect(progreso).toBe(Math.round((100 * 1) / 7)); // 14
  });

  it('B usa la aplicabilidad por estructura (todo 0 → completo)', () => {
    const sinOrganos = { cs: 0, cpc: 0, cc: 0, crsf: 0, st: 0 };
    const { bloqueStatuses } = deriveStatuses(emptyReport.formData, sinOrganos);
    expect(bloqueStatuses.B).toBe('completo');
  });
});
