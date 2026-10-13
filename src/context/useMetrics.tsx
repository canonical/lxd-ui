import {
  useQueries,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useAuth } from "./auth";
import { queryKeys } from "util/queryKeys";
import { fetchMetrics } from "api/metrics";
import type { LxdMetricGroup } from "types/metrics";
import { useServerEntitlements } from "util/entitlements/server";
import { useMetricHistory } from "context/metricHistory";

const useMetricsQueryOptions = () => {
  const { isRestricted, isFineGrained } = useAuth();
  const { canViewMetrics } = useServerEntitlements();
  const { setMetricEntry } = useMetricHistory();

  return (location: string) => ({
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

export const useMetrics = (
  location: string,
): UseQueryResult<LxdMetricGroup[]> => {
  const getOptions = useMetricsQueryOptions();

  return useQuery(getOptions(location));
};

export const useMetricsByLocation = (
  locations: string[],
): Map<string, LxdMetricGroup[]> => {
  const getOptions = useMetricsQueryOptions();
  const uniqueLocations = [...new Set(locations)];

  const results = useQueries({
    queries: uniqueLocations.map(getOptions),
  });

  return new Map(
    uniqueLocations.map((location, index) => [
      location,
      results[index]?.data ?? [],
    ]),
  );
};
