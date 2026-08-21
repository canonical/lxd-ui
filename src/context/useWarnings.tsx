import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchWarnings } from "api/warnings";
import type { LxdWarning } from "types/warning";
import { queryKeys } from "util/queryKeys";

export const useWarnings = (): UseQueryResult<LxdWarning[]> => {
  return useQuery<LxdWarning[], Error>({
    queryKey: [queryKeys.warnings],
    queryFn: async () => fetchWarnings(),
    retry: false, // the api returns a 403 for users with limited permissions, surface the error right away
  });
};
