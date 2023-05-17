import { LxdConfigPair } from "./config";

export interface LxdSettings {
  api_status: string;
  config: LxdConfigPair;
  environment?: {
    architectures: string[];
    server_version: ?string;
    server_clustered: boolean;
  };
}
