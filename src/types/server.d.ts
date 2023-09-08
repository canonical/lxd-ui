import { LxdConfigPair } from "./config";

type LXDAuthMethods = "tls" | "oidc" | "unix";

export interface LxdSettings {
  api_status: string;
  config: LxdConfigPair;
  environment?: {
    architectures: string[];
    server_version: ?string;
    server_clustered: boolean;
  };
  auth?: "trusted";
  auth_methods?: LXDAuthMethods;
  auth_user_method?: LXDAuthMethods;
}
