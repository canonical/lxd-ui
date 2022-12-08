export interface LxdNetwork {
  config: {
    "ipv4.address": string;
    "ipv4.nat": string;
    "ipv6.address": string;
    "ipv6.nat": string;
  };
  description: string;
  locations: string[];
  managed: boolean;
  name: string;
  status: string;
  type: string;
  used_by?: string[];
}
