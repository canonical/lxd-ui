declare module "parse-prometheus-text-format" {
  import type { LxdMetricGroup } from "types/metrics";

  export default function parsePrometheusTextFormat(
    input: string,
  ): LxdMetricGroup[];
}
