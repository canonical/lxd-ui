export interface LxdMetricGroup {
  name: string;
  help: string;
  type: string;
  metrics: LxdMetric[];
}

export interface LxdMetric {
  labels: {
    cpu?: string;
    device?: string;
    mode?: string;
    mountpoint?: string;
    name: string;
    project: string;
    type: string;
  };
  value: string;
}
