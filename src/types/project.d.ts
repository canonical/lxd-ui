import type { LxdConfigPair } from "types/config";

export interface LxdProject {
  name: string;
  config: LxdConfigPair;
  description: string;
  used_by?: string[];
  etag?: string;
  access_entitlements?: string[];
}
