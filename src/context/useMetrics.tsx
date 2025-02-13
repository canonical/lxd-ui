import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { queryKeys } from "util/queryKeys";
import { fetchMetrics } from "api/metrics";
import { LxdMetricGroup } from "types/metrics";

export const useMetrics = (
  location: string,
): UseQueryResult<LxdMetricGroup[]> => {
  const { isRestricted } = useAuth();

  return useQuery({
    queryKey: [queryKeys.metrics, location],
    queryFn: () => fetchMetrics(location),
    refetchInterval: 15 * 1000, // 15 seconds
    enabled: !isRestricted,
  });
};
