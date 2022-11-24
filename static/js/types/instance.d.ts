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
}

interface LxdSnapshot {
  name: string;
  created_at: string;
  expires_at: string;
  stateful: boolean;
}

export interface LxdInstance {
  name: string;
  status: string;
  type: string;
  config: LxdInstanceConfig;
  state: LxdInstanceState;
  snapshots: LxdSnapshot[] | null;
}
