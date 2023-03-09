export interface LxdMetricGroup {
  name: string;
  help: string;
  type: string;
  metrics: LxdMetric[];
}

export interface LxdMetric {
  value: number;
  labels: {
    name: string;
    mountpoint?: string;
    project: string;
    type: string;
  };
}
