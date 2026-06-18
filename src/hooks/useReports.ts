import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getReports, getReport, saveReport, updateComentariosAdmin, getLatestReportedPeriodoId } from '../services/reports';
import type { FormData } from '../types';
import { qk } from './queryKeys';

export function useReports(periodoId: string | undefined) {
  return useQuery({
    queryKey: qk.reports(periodoId),
    queryFn: () => getReports(periodoId!),
    enabled: !!periodoId,
  });
}

// Período por defecto del tablero admin: el más reciente con reportes.
export function useLatestReportedPeriodo() {
  return useQuery({ queryKey: qk.latestReportedPeriodo, queryFn: getLatestReportedPeriodoId });
}

export function useReport(estadoId: string | undefined, periodoId: string | undefined) {
  return useQuery({
    queryKey: qk.report(estadoId, periodoId),
    queryFn: () => getReport(estadoId!, periodoId!),
    enabled: !!estadoId && !!periodoId,
  });
}

export function useSaveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { estadoId: string; periodoId: string; formData: FormData; expectedUpdatedAt?: string | null }) =>
      saveReport(v.estadoId, v.periodoId, v.formData, v.expectedUpdatedAt),
    onSuccess: (_data, v) => {
      qc.invalidateQueries({ queryKey: qk.report(v.estadoId, v.periodoId) });
      qc.invalidateQueries({ queryKey: qk.reports(v.periodoId) });
    },
  });
}

export function useUpdateComentarios() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { estadoId: string; periodoId: string; comentarios: string; expectedUpdatedAt: string | null }) =>
      updateComentariosAdmin(v.estadoId, v.periodoId, v.comentarios, v.expectedUpdatedAt),
    onSuccess: (_data, v) => {
      qc.invalidateQueries({ queryKey: qk.report(v.estadoId, v.periodoId) });
      qc.invalidateQueries({ queryKey: qk.reports(v.periodoId) });
    },
  });
}
