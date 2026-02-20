import type { LxdConfigPair } from "./config";
import { type LXDAuthMethod } from "util/authentication";

interface SupportedStorageDriver {
  Name: string;
  Version: string;
  Remote: boolean;
}

export interface LxdSettings {
  api_status: string;
  api_extensions?: string[];
  auth?: "trusted" | "untrusted";
  auth_methods?: LXDAuthMethod;
  auth_user_method?: LXDAuthMethod;
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
