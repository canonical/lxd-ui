export type LxdClusterMemberAction = "evacuate" | "restore";

export type LxdClusterMemberStatus =
  | "Evacuated"
  | "Online"
  | "Offline"
  | "Blocked";

export interface LxdClusterMember {
  architecture: string;
  database: boolean;
  description: string;
  failure_domain: string;
  groups?: string[];
  message: string;
  roles: string[];
  server_name: string;
  status: LxdClusterMemberStatus;
  url: string;
}

export interface LxdClusterMemberState {
  sysinfo: {
    uptime: number;
    load_averages: [number, number, number];
    total_ram: number;
    free_ram: number;
    shared_ram: number;
    buffered_ram: number;
    total_swap: number;
    free_swap: number;
    processes: number;
    logical_cpus: number;
  };
  storage_pools: string[];
}

export interface LxdClusterGroup {
  description: string;
  members: string[];
  name: string;
  used_by?: string[];
}

export interface LxdClusterLink {
  config: Record<string, string>;
  description: string;
  name: string;
  type: string;
}

export interface LxdClusterLinkState {
  cluster_link_members: LxdClusterLinkMemberState[];
}

export interface LxdClusterLinkMemberState {
  address: string;
  server_name: string;
  status: "Active" | "Unreachable";
}

export interface LxdClusterLinkCreated {
  addresses: string[];
  client_name: string;
  expires_at: string;
  fingerprint: string;
  secret: string;
  type: "Client certificate (pending)" | "Client certificate";
}
