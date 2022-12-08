import { LxdConfigPair, LxdDevices } from "./common";

export interface LxdProfile {
  config: LxdConfigPair;
  devices: LxdDevices;
  description: string;
  name: string;
  used_by: string[];
}
