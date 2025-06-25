export type LxdClusterMemberAction = "evacuate" | "restore";

export type LxdClusterMemberStatus = "Evacuated" | "Online";

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

export interface LxdClusterGroup {
  description: string;
  members: string[];
  name: string;
}

export interface LxdClusterLink {
  description: string;
  name: string;
  type?: string;
  config: Record<string, string>;
}

export interface LxdClusterLinkCreateResponse {
  client_name: string;
  addresses: string[];
  expires_at: string;
  fingerprint: string;
  type: "Client certificate (pending)" | "Client certificate";
  secret: string;
}
