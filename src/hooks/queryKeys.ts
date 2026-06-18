// Centralized React Query keys so reads and the invalidations in AppContext /
// mutations stay in sync.
export const qk = {
  estados: ['estados'] as const,
  estructura: ['estructura'] as const,
  periodos: ['periodos'] as const,
  archivedPeriodos: ['periodos', 'archived'] as const,
  activePeriodo: ['periodo', 'active'] as const,
  latestReportedPeriodo: ['periodo', 'latest-reported'] as const,
  reports: (periodoId: string | undefined) => ['reports', periodoId] as const,
  report: (estadoId: string | undefined, periodoId: string | undefined) =>
    ['report', estadoId, periodoId] as const,
};
