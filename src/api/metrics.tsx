import parsePrometheusTextFormat from "parse-prometheus-text-format";
import type { LxdMetricGroup } from "types/metrics";

export const fetchMetrics = async (
  target: string,
): Promise<LxdMetricGroup[]> => {
  // in a simple and non-clustered environment, the LXD api responds
  // with instance.location as "none". Handle it, to avoid sending an invalid target
  const params = target === "none" ? "" : `?target=${target}`;

  return fetch(`/1.0/metrics${encodeURIComponent(params)}`)
    .then(async (response) => {
      return response.text();
    })
    .then((text) => {
      return parsePrometheusTextFormat(text);
    });
};
