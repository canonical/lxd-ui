import parsePrometheusTextFormat from "parse-prometheus-text-format";
import type { LxdMetricGroup } from "types/metrics";
import { addTarget } from "util/target";
import { ROOT_PATH } from "util/rootPath";

export const fetchMetrics = async (
  target: string,
): Promise<LxdMetricGroup[]> => {
  // in a simple and non-clustered environment, the LXD api responds
  // with instance.location as "none". Handle it, to avoid sending an invalid target
  const params = new URLSearchParams();
  addTarget(params, target);

  return fetch(`${ROOT_PATH}/1.0/metrics?${params.toString()}`)
    .then(async (response) => {
      return response.text();
    })
    .then((text) => {
      return parsePrometheusTextFormat(text);
    });
};
