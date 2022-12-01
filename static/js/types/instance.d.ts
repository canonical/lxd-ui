interface LxdInstanceConfig {
  "migration.stateful"?: boolean;
}

interface LxdInstanceState {
  network: {
    eth0: {
      addresses: {
        family: string;
        address: string;
      }[];
    };
  };
  cpu: { usage: number };
  disk: {
    root: { usage: number };
  };
  memory: {
    usage: number;
    usage_peak: number;
    swap_usage: number;
    swap_usage_peak: number;
  };
}

interface LxdSnapshot {
  name: string;
  created_at: string;
  expires_at: string;
  stateful: boolean;
}

export interface LxdInstance {
  architecture: string;
  config: LxdInstanceConfig;
  created_at: string;
  description: string;
  ephemeral: boolean;
  last_used_at: string;
  location: string;
  name: string;
  profiles: string[];
  project: string;
  snapshots: LxdSnapshot[] | null;
  state: LxdInstanceState;
  stateful: boolean;
  status: string;
  type: string;
}
