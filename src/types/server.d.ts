import type { LxdConfigPair } from "./config";

type LXDAuthMethods = "tls" | "oidc" | "unix";

interface SupportedStorageDriver {
  Name: string;
  Version: string;
  Remote: boolean;
}

export interface LxdSettings {
  api_status: string;
  api_extensions?: string[];
  auth?: "trusted" | "untrusted";
  auth_methods?: LXDAuthMethods;
  auth_user_method?: LXDAuthMethods;
  auth_user_name?: string;
  client_certificate?: boolean;
  config?: LxdConfigPair;
  environment?: {
    architectures: string[];
    os_name?: string;
    server_version?: string;
    server_clustered: boolean;
    storage_supported_drivers: SupportedStorageDriver[];
    backup_metadata_version_range?: number[];
  };
}

export type LXDSettingOnClusterMember = LxdSettings & {
  memberName: string;
};
