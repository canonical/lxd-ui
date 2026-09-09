import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchWarnings } from "api/warnings";
import type { LxdWarning } from "types/warning";
import { queryKeys } from "util/queryKeys";

export const useWarnings = (enabled = true): UseQueryResult<LxdWarning[]> => {
  return useQuery<LxdWarning[], Error>({
    queryKey: [queryKeys.warnings],
    queryFn: async () => fetchWarnings(),
    retry: false,
    enabled,
  });
};
