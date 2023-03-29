import { LxdConfigPair } from "./config";
import { LxdDevices } from "./device";

export interface LxdProfile {
  config: LxdConfigPair;
  description: string;
  devices: LxdDevices;
  name: string;
  used_by?: string[];
  etag?: string;
}
