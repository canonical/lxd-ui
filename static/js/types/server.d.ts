export interface LxdSettings {
  api_status: string;
  config: LxdConfigPair;
}

export interface LxdConfigPair {
  [key: string]: string;
}

export interface LxdConfigOption {
  key: string;
  type: "string" | "integer" | "bool";
  scope: "global" | "local";
  default: string | boolean;
  description: string;
}
