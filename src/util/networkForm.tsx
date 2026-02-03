import type {
  LxdNetwork,
  LxdNetworkBridgeDriver,
  LxdNetworkDnsMode,
  LXDNetworkOnClusterMember,
} from "types/network";
import type { NetworkFormValues } from "types/forms/network";
import { getNetworkAcls, getNetworkKey } from "util/networks";
import type { ClusterSpecificValues } from "types/cluster";

export const toNetworkFormValues = (
  network: LxdNetwork,
  networkOnMembers?: LXDNetworkOnClusterMember[],
  editRestriction?: string,
): NetworkFormValues => {
  const parentPerClusterMember: ClusterSpecificValues = {};
  networkOnMembers?.forEach(
    (item) =>
      (parentPerClusterMember[item.memberName] = item.config.parent ?? ""),
  );

  const bridge_external_interfaces_per_member: ClusterSpecificValues = {};
  networkOnMembers?.forEach(
    (item) =>
      (bridge_external_interfaces_per_member[item.memberName] =
        item.config[getNetworkKey("bridge_external_interfaces")] ?? ""),
  );
  const hasBridgeExternalInterfacesPerMember = Object.values(
    bridge_external_interfaces_per_member,
  ).find((item) => item.length > 0);

  return {
    readOnly: true,
    isCreating: false,
    name: network.name,
    description: network.description,
    networkType: network.type,
    bridge_driver: network.config[
      getNetworkKey("bridge_driver")
    ] as LxdNetworkBridgeDriver,
    bridge_external_interfaces: hasBridgeExternalInterfacesPerMember
      ? "set"
      : network.config[getNetworkKey("bridge_external_interfaces")],
    bridge_external_interfaces_per_member,
    bridge_hwaddr: network.config[getNetworkKey("bridge_hwaddr")],
    bridge_mtu: network.config[getNetworkKey("bridge_mtu")],
    dns_domain: network.config[getNetworkKey("dns_domain")],
    dns_mode: network.config[getNetworkKey("dns_mode")] as LxdNetworkDnsMode,
    dns_nameservers: network.config[getNetworkKey("dns_nameservers")],
    dns_search: network.config[getNetworkKey("dns_search")],
    gvrp: network.config.gvrp,
    ipv4_address: network.config[getNetworkKey("ipv4_address")],
    ipv4_dhcp: network.config[getNetworkKey("ipv4_dhcp")],
    ipv4_dhcp_expiry: network.config[getNetworkKey("ipv4_dhcp_expiry")],
    ipv4_dhcp_ranges: network.config[getNetworkKey("ipv4_dhcp_ranges")],
    ipv4_l3only: network.config[getNetworkKey("ipv4_l3only")],
    ipv4_nat: network.config[getNetworkKey("ipv4_nat")],
    ipv4_nat_address: network.config[getNetworkKey("ipv4_nat_address")],
    ipv4_ovn_ranges: network.config[getNetworkKey("ipv4_ovn_ranges")],
    ipv4_gateway: network.config[getNetworkKey("ipv4_gateway")],
    ipv4_routes: network.config[getNetworkKey("ipv4_routes")],
    ipv4_routes_anycast: network.config[getNetworkKey("ipv4_routes_anycast")],
    ipv6_address: network.config[getNetworkKey("ipv6_address")],
    ipv6_dhcp: network.config[getNetworkKey("ipv6_dhcp")],
    ipv6_dhcp_expiry: network.config[getNetworkKey("ipv6_dhcp_expiry")],
    ipv6_dhcp_ranges: network.config[getNetworkKey("ipv6_dhcp_ranges")],
    ipv6_dhcp_stateful: network.config[getNetworkKey("ipv6_dhcp_stateful")],
    ipv6_l3only: network.config[getNetworkKey("ipv6_l3only")],
    ipv6_nat: network.config[getNetworkKey("ipv6_nat")],
    ipv6_nat_address: network.config[getNetworkKey("ipv6_nat_address")],
    ipv6_ovn_ranges: network.config[getNetworkKey("ipv6_ovn_ranges")],
    ipv6_gateway: network.config[getNetworkKey("ipv6_gateway")],
    ipv6_routes: network.config[getNetworkKey("ipv6_routes")],
    ipv6_routes_anycast: network.config[getNetworkKey("ipv6_routes_anycast")],
    mtu: network.config.mtu,
    ovn_ingress_mode: network.config[getNetworkKey("ovn_ingress_mode")],
    network: network.config.network,
    parent: network.config.parent,
    security_acls: getNetworkAcls(network),
    vlan: network.config.vlan,
    parentPerClusterMember,
    entityType: "network",
    bareNetwork: network,
    editRestriction,
    security_acls_default_egress:
      network.config[getNetworkKey("security_acls_default_egress")],
    security_acls_default_ingress:
      network.config[getNetworkKey("security_acls_default_ingress")],
  };
};
