import type { LxdConfigPair } from "./config";
import type { LxdDevices } from "./device";

export interface LxdProfile {
  config: LxdConfigPair;
  description: string;
  devices: LxdDevices;
  name: string;
  used_by?: string[];
  etag?: string;
  access_entitlements?: string[];
}
