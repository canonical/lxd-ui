import { LxdConfigPair } from "./config";
import { LxdDevices } from "./device";

export interface LxdProfile {
  config: LxdConfigPair;
  devices: LxdDevices;
  description: string;
  name: string;
  used_by: string[];
}
