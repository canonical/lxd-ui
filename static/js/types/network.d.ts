export interface LxdNetwork {
  name: string;
  config: {
    "ipv4.address": string;
    "ipv4.nat": string;
    "ipv6.address": string;
    "ipv6.nat": string;
  };
  description: string;
  locations: null;
  managed: boolean;
  status: string;
  type: string;
  used_by?: string[];
}
