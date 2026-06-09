export interface LoadBalancerFormValues {
  listenAddress: string;
  description: string;
  ports: LoadBalancerPortFormValues[];
}

export interface LoadBalancerPortFormValues {
  key: string;
  protocol: "tcp" | "udp";
  listenPort: string;
  targetPool: string;
}

export interface LoadBalancerPoolFormValues {
  name: string;
  description: string;
  targetPort: string;
  protocol: "tcp" | "udp";
  instances: LoadBalancerPoolInstanceFormValues[];
  healthCheckType: "default" | "custom" | "disabled";
  healthCheckInterval?: string;
  healthCheckTimeout?: string;
  healthCheckSuccessCount?: string;
  healthCheckFailureCount?: string;
}

export interface LoadBalancerPoolInstanceFormValues {
  name: string;
  targetPort?: string;
}
