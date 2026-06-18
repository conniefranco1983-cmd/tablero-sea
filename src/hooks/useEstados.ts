import { useQuery } from '@tanstack/react-query';
import { getEstados } from '../services/reference';
import { qk } from './queryKeys';

export function useEstados() {
  return useQuery({ queryKey: qk.estados, queryFn: getEstados });
}
