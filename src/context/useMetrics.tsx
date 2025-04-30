import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { queryKeys } from "util/queryKeys";
import { fetchMetrics } from "api/metrics";
import type { LxdMetricGroup } from "types/metrics";
import { useServerEntitlements } from "util/entitlements/server";
import { useMetricHistory } from "context/metricHistory";

export const useMetrics = (
  location: string,
): UseQueryResult<LxdMetricGroup[]> => {
  const { isRestricted, isFineGrained } = useAuth();
  const { canViewMetrics } = useServerEntitlements();
  const { setMetricEntry } = useMetricHistory();

  return useQuery({
    queryKey: [queryKeys.metrics, location],
    queryFn: async () =>
      fetchMetrics(location).then((metric) => {
        setMetricEntry({ time: Date.now() / 1000, metric });
        return metric;
      }),
    refetchInterval: 15 * 1000, // 15 seconds
    enabled: !isRestricted && isFineGrained !== null && canViewMetrics(),
  });
};
