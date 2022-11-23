export interface LxdClusterMember {
  architecture: string;
  database: boolean;
  description: string;
  failure_domain: string;
  groups: string[];
  message: string;
  roles: string[];
  server_name: string;
  status: string;
  url: string;
}
