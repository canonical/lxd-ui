export type LxdConfigPair = Record<string, string>;

export interface LxdConfigOption {
  default: string | boolean;
  description: string;
  key: string;
  scope: "global" | "local";
  type: "string" | "integer" | "bool";
}
