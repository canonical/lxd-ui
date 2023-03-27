import { LxdConfigPair } from "types/config";

export interface LxdProject {
  name: string;
  config: LxdConfigPair;
  description: string;
  used_by?: string[];
  etag?: string;
}
