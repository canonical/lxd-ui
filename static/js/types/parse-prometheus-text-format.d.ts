declare module "parse-prometheus-text-format" {
  import { LxdMetricGroup } from "./metrics";

  function parsePrometheusTextFormat(input: string): LxdMetricGroup[];
  export = parsePrometheusTextFormat;
}
