import { LxdConfigPair } from "./config";

type LXDAuthMethods = "tls" | "oidc" | "unix";

type SupportedStorageDriver = {
  Name: string;
  Version: string;
  Remote: boolean;
};

export interface LxdSettings {
  api_status: string;
  config?: LxdConfigPair;
  environment?: {
    architectures: string[];
    os_name?: string;
    server_version?: string;
    server_clustered: boolean;
    storage_supported_drivers: SupportedStorageDriver[];
  };
  auth?: "trusted" | "untrusted";
  auth_methods?: LXDAuthMethods;
  auth_user_method?: LXDAuthMethods;
  auth_user_name?: string;
  api_extensions?: string[];
}
