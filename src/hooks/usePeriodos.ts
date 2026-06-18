import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPeriodos,
  getArchivedPeriodos,
  getActivePeriodo,
  createPeriodo,
  setActivePeriodo,
  deletePeriodo,
  restorePeriodo,
} from '../services/periodos';
import type { Periodo } from '../types';
import { qk } from './queryKeys';

export function usePeriodos() {
  return useQuery({ queryKey: qk.periodos, queryFn: getPeriodos });
}

export function useArchivedPeriodos() {
  return useQuery({ queryKey: qk.archivedPeriodos, queryFn: getArchivedPeriodos });
}

export function useActivePeriodo(enabled = true) {
  return useQuery({ queryKey: qk.activePeriodo, queryFn: getActivePeriodo, enabled });
}

function useInvalidatePeriodos() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: qk.periodos });
    qc.invalidateQueries({ queryKey: qk.archivedPeriodos });
    qc.invalidateQueries({ queryKey: qk.activePeriodo });
    qc.invalidateQueries({ queryKey: qk.latestReportedPeriodo });
  };
}

export function useCreatePeriodo() {
  const invalidate = useInvalidatePeriodos();
  return useMutation({
    mutationFn: (p: Periodo) => createPeriodo(p),
    onSuccess: invalidate,
  });
}

export function useSetActivePeriodo() {
  const invalidate = useInvalidatePeriodos();
  return useMutation({
    mutationFn: (id: string) => setActivePeriodo(id),
    onSuccess: invalidate,
  });
}

export function useDeletePeriodo() {
  const invalidate = useInvalidatePeriodos();
  return useMutation({
    mutationFn: (id: string) => deletePeriodo(id),
    onSuccess: invalidate,
  });
}

export function useRestorePeriodo() {
  const invalidate = useInvalidatePeriodos();
  return useMutation({
    mutationFn: (id: string) => restorePeriodo(id),
    onSuccess: invalidate,
  });
}
