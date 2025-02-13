import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { queryKeys } from "util/queryKeys";
import { fetchMetrics } from "api/metrics";
import { LxdMetricGroup } from "types/metrics";
import { useServerEntitlements } from "util/entitlements/server";

export const useMetrics = (
  location: string,
): UseQueryResult<LxdMetricGroup[]> => {
  const { isRestricted, isFineGrained } = useAuth();
  const { canViewMetrics } = useServerEntitlements();

  return useQuery({
    queryKey: [queryKeys.metrics, location],
    queryFn: () => fetchMetrics(location),
    refetchInterval: 15 * 1000, // 15 seconds
    enabled: !isRestricted && isFineGrained !== null && canViewMetrics(),
  });
};
