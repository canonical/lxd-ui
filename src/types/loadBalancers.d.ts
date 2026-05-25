export interface LxdLoadBalancer {
  listen_address: string;
  description: string;
  backends?: LxdLoadBalancerLegacyBackend[];
  ports: LxdLoadBalancerPort[];
}

export interface LxdLoadBalancerLegacyBackend {
  description: string;
  name: string;
  target_address: string;
  target_port: string;
}

export interface LxdLoadBalancerPort {
  protocol: "tcp" | "udp";
  listen_port: string;
  target_pool: string;
}

export interface LxdLoadBalancerPool {
  name: string;
  description: string;
  config: {
    target_port: string;
    protocol: "tcp" | "udp";
    healthcheck?: "false" | "true";
    "healthcheck.interval"?: string;
    "healthcheck.timeout"?: string;
    "healthcheck.success_count"?: string;
    "healthcheck.failure_count"?: string;
  };
  instances: LxdLoadBalancerPoolInstance[];
  used_by?: string[];
}

export interface LxdLoadBalancerPoolInstance {
  name: string;
  target_port?: string;
}

export interface LxdLoadBalancerPoolStatus {
  targets: LxdLoadBalancerPoolTarget[];
}

export interface LxdLoadBalancerPoolTarget {
  address: string;
  device: string;
  port: string;
  name: string;
  listen_port: string;
  listen_address: string;
  status: "unknown" | "offline" | "online";
}
