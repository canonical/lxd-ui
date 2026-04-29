import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchSettings } from "api/server";
import type { LxdSettings } from "types/server";
import type { UseQueryResult } from "@tanstack/react-query";

export const useSettings = (): UseQueryResult<LxdSettings> => {
  return useQuery({
    queryKey: [queryKeys.settings],
    queryFn: async () => fetchSettings(),
    staleTime: 60_000, // consider cache fresh for 1 minute to avoid excessive API calls
  });
};
