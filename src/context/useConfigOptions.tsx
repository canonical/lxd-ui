import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchConfigOptions } from "api/server";
import { queryKeys } from "util/queryKeys";
import type { LxdMetadata } from "types/config";

export const useConfigOptions = (): UseQueryResult<LxdMetadata | null> => {
  return useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: fetchConfigOptions,
  });
};
