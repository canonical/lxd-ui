import type {
  LxdNetwork,
  LxdNetworkBridgeDriver,
  LxdNetworkDnsMode,
  LxdNetworkType,
} from "types/network";
import type { ClusterSpecificValues } from "types/cluster";

export interface NetworkFormValues {
  readOnly: boolean;
  isCreating: boolean;
  name: string;
  description?: string;
  networkType: LxdNetworkType;
  bridge_driver?: LxdNetworkBridgeDriver;
  bridge_external_interfaces?: string;
  bridge_external_interfaces_per_member?: ClusterSpecificValues;
  bridge_hwaddr?: string;
  bridge_mtu?: string;
  dns_domain?: string;
  dns_mode?: LxdNetworkDnsMode;
  dns_nameservers?: string;
  dns_search?: string;
  gvrp?: string;
  ipv4_address?: string;
  ipv4_dhcp?: string;
  ipv4_dhcp_expiry?: string;
  ipv4_dhcp_ranges?: string;
  ipv4_l3only?: string;
  ipv4_nat?: string;
  ipv4_nat_address?: string;
  ipv4_ovn_ranges?: string;
  ipv4_gateway?: string;
  ipv4_routes?: string;
  ipv4_routes_anycast?: string;
  ipv6_address?: string;
  ipv6_dhcp?: string;
  ipv6_dhcp_expiry?: string;
  ipv6_dhcp_ranges?: string;
  ipv6_dhcp_stateful?: string;
  ipv6_l3only?: string;
  ipv6_nat?: string;
  ipv6_nat_address?: string;
  ipv6_ovn_ranges?: string;
  ipv6_gateway?: string;
  ipv6_routes?: string;
  ipv6_routes_anycast?: string;
  mtu?: string;
  network?: string;
  ovn_ingress_mode?: string;
  parent?: string;
  parentPerClusterMember?: ClusterSpecificValues;
  security_acls: string[];
  vlan?: string;
  yaml?: string;
  entityType: "network";
  bareNetwork?: LxdNetwork;
  editRestriction?: string;
  security_acls_default_egress?: string;
  security_acls_default_ingress?: string;
}
