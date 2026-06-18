import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEstructura, updateEstructura } from '../services/estructura';
import type { OrganoKey } from '../types';
import { qk } from './queryKeys';

export function useEstructura() {
  return useQuery({ queryKey: qk.estructura, queryFn: getEstructura });
}

export function useUpdateEstructura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { estadoId: string; organo: OrganoKey; value: number }) =>
      updateEstructura(v.estadoId, v.organo, v.value),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.estructura }),
  });
}
