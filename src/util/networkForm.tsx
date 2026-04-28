import * as Yup from "yup";
import type {
  LxdNetwork,
  LxdNetworkBridgeDriver,
  LxdNetworkDnsMode,
  LXDNetworkOnClusterMemberFulfilled,
} from "types/network";
import type { NetworkFormValues } from "types/forms/network";
import type { ClusterSpecificValues } from "types/cluster";
import type { AbortControllerState } from "util/helpers";
import { checkDuplicateName } from "util/helpers";
import { getNetworkAcls, getNetworkKey } from "util/networks";

export const toNetworkFormValues = (
  network: LxdNetwork,
  networkOnMembers?: LXDNetworkOnClusterMemberFulfilled[],
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

export const getNetworkNameValidation = (
  project: string,
  controllerState: AbortControllerState,
  excludeName?: string,
) => {
  return Yup.string()
    .min(2, "Minimum length is 2 characters")
    .max(15, "Maximum length is 15 characters")
    .test(
      "no-double-dots",
      "Network name must not contain '..'",
      (value) => !value || !value.includes(".."),
    )
    .matches(
      /^[-_a-zA-Z0-9.]+$/,
      "Network name can only contain letters, numbers, hyphens, underscores, and periods",
    )
    .test(
      "deduplicate",
      "A network with this name already exists",
      async (value) =>
        (excludeName && value === excludeName) ||
        checkDuplicateName(value, project, controllerState, "networks"),
    )
    .required("Network name is required");
};
