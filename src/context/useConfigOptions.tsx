import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchConfigOptions } from "api/server";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { queryKeys } from "util/queryKeys";
import type { LxdMetadata } from "types/config";

export const useConfigOptions = (): UseQueryResult<LxdMetadata | null> => {
  const { hasMetadataConfiguration } = useSupportedFeatures();

  return useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: async () => fetchConfigOptions(hasMetadataConfiguration),
  });
};
