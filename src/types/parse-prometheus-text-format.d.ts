declare module "parse-prometheus-text-format" {
  import { LxdMetricGroup } from "types/metrics";

  export default function parsePrometheusTextFormat(
    input: string,
  ): LxdMetricGroup[];
}
