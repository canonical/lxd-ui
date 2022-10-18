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

interface LxdSnapshots {
  name: string;
}

export interface LxdInstance {
  name: string;
  status: string;
  type: string;
  state: LxdInstanceState;
  snapshots: LxdSnapshots[] | null;
}