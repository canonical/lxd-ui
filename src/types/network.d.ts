export type LxdNetworkBridgeDriver = "native" | "openvswitch";
export type LxdNetworkType = "bridge" | "ovn";
export type LxdNetworkDnsMode = "none" | "managed" | "dynamic";
export type LxdNetworkFanType = "vxlan" | "ipip";

export interface LxdNetworkConfig {
  "bridge.driver"?: LxdNetworkBridgeDriver;
  "bridge.external_interfaces"?: string;
  "bridge.hwaddr"?: string;
  "bridge.mtu"?: string;
  "dns.domain"?: string;
  "dns.mode"?: LxdNetworkDnsMode;
  "dns.search"?: string;
  "dns.zone.forward"?: string;
  "dns.zone.reverse.ipv4"?: string;
  "dns.zone.reverse.ipv6"?: string;
  "fan.type"?: LxdNetworkFanType;
  "fan.overlay_subnet"?: string;
  "fan.underlay_subnet"?: string;
  "ipv4.address"?: string;
  "ipv4.dhcp"?: string;
  "ipv4.dhcp.expiry"?: string;
  "ipv4.dhcp.gateway"?: string;
  "ipv4.dhcp.ranges"?: string;
  "ipv4.firewall"?: string;
  "ipv4.l3only"?: string;
  "ipv4.nat"?: string;
  "ipv4.nat.address"?: string;
  "ipv4.nat.order"?: string;
  "ipv4.ovn.ranges"?: string;
  "ipv4.routes"?: string;
  "ipv4.routing"?: string;
  "ipv6.address"?: string;
  "ipv6.dhcp"?: string;
  "ipv6.dhcp.expiry"?: string;
  "ipv6.dhcp.ranges"?: string;
  "ipv6.dhcp.stateful"?: string;
  "ipv6.firewall"?: string;
  "ipv6.l3only"?: string;
  "ipv6.nat"?: string;
  "ipv6.nat.address"?: string;
  "ipv6.nat.order"?: string;
  "ipv6.ovn.ranges"?: string;
  "ipv6.routes"?: string;
  "ipv6.routing"?: string;
  network?: string;
  [key: `user.${string}`]: string;
}

export interface LxdNetwork {
  config: LxdNetworkConfig;
  description?: string;
  locations?: string[];
  managed?: boolean;
  name: string;
  status?: string;
  type: LxdNetworkType;
  used_by?: string[];
  etag?: string;
}

export interface LxdNetworkStateAddress {
  family: string;
  address: string;
  netmask: string;
  scope: string;
}

export interface LxdNetworkState {
  addresses: LxdNetworkStateAddress[];
  bond?: string;
  bridge: {
    forward_delay: number;
    id: string;
    stp: boolean;
    upper_devices: string[];
    vlan_default: number;
    vlan_filtering: boolean;
  };
  counters: {
    bytes_received: number;
    bytes_sent: number;
    packets_received: number;
    packets_sent: number;
  };
  hwaddr: string;
  mtu: number;
  ovn?: string;
  state: string;
  type: string;
  vlan?: string;
}

export interface LxdNetworkForwardPort {
  description?: string;
  listen_port: string;
  protocol: "tcp" | "udp";
  target_address: string;
  target_port?: string;
}

export interface LxdNetworkForward {
  listen_address: string;
  config: {
    target_address?: string;
  };
  description?: string;
  location?: string;
  ports: LxdNetworkForwardPort[];
}
