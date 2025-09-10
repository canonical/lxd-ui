import type { IpAddress, IpFamily, LxdInstance } from "types/instance";
import type { LxdNetwork, LxdNetworkConfig } from "types/network";
import type { LxdConfigOptionsKeys } from "types/config";
import { capitalizeFirstLetter } from "util/helpers";

export const bridgeType = "bridge";
export const macvlanType = "macvlan";
export const ovnType = "ovn";
export const physicalType = "physical";
export const sriovType = "sriov";

export const clusteredTypes = [
  bridgeType,
  macvlanType,
  physicalType,
  sriovType,
];

export const typesForUplink = [bridgeType, physicalType];

export const typesWithAcls = [bridgeType, ovnType];
export const typesWithForwards = [bridgeType, ovnType];
export const typesWithParent = [physicalType, sriovType, macvlanType];
export const typesWithStatistics = [bridgeType, ovnType, physicalType];

export const getIpAddresses = (
  instance: LxdInstance,
  family: IpFamily,
): IpAddress[] => {
  if (!instance.state?.network) return [];
  return Object.entries(instance.state.network)
    .filter(([key, _value]) => key !== "lo")
    .flatMap(([key, value]) =>
      value.addresses.map((item) => {
        return { ...item, iface: key };
      }),
    )
    .filter((item) => item.family === family);
};

export const isLocalIPv6 = (ipv6Address: string): boolean => {
  const normalizedAddress = ipv6Address.toLowerCase();

  if (normalizedAddress === "::1") {
    return true;
  }

  const firstHextet = parseInt(normalizedAddress.split(":")[0], 16);
  if (firstHextet >= 0xfe80 && firstHextet <= 0xfebf) {
    return true;
  }

  return false;
};

export const sortIpv6Addresses = (ipv6Addresses: IpAddress[]): IpAddress[] => {
  if (ipv6Addresses.length === 0) return [];

  // Set local addresses at the end
  return ipv6Addresses.sort((a, b) => {
    const isA_local = isLocalIPv6(a.address);
    const isB_local = isLocalIPv6(b.address);
    return isA_local === isB_local ? 0 : isA_local ? 1 : -1;
  });
};

export const networkFormFieldToPayloadName: Record<
  string,
  keyof LxdNetworkConfig
> = {
  bridge_driver: "bridge.driver",
  bridge_external_interfaces: "bridge.external_interfaces",
  bridge_hwaddr: "bridge.hwaddr",
  bridge_mtu: "bridge.mtu",
  dns_domain: "dns.domain",
  dns_mode: "dns.mode",
  dns_nameservers: "dns.nameservers",
  dns_search: "dns.search",
  gvrp: "gvrp",
  ipv4_address: "ipv4.address",
  ipv4_dhcp: "ipv4.dhcp",
  ipv4_dhcp_expiry: "ipv4.dhcp.expiry",
  ipv4_dhcp_ranges: "ipv4.dhcp.ranges",
  ipv4_l3only: "ipv4.l3only",
  ipv4_nat: "ipv4.nat",
  ipv4_nat_address: "ipv4.nat.address",
  ipv4_ovn_ranges: "ipv4.ovn.ranges",
  ipv4_gateway: "ipv4.gateway",
  ipv4_routes: "ipv4.routes",
  ipv4_routes_anycast: "ipv4.routes.anycast",
  ipv6_address: "ipv6.address",
  ipv6_dhcp: "ipv6.dhcp",
  ipv6_dhcp_expiry: "ipv6.dhcp.expiry",
  ipv6_dhcp_ranges: "ipv6.dhcp.ranges",
  ipv6_dhcp_stateful: "ipv6.dhcp.stateful",
  ipv6_l3only: "ipv6.l3only",
  ipv6_nat: "ipv6.nat",
  ipv6_nat_address: "ipv6.nat.address",
  ipv6_ovn_ranges: "ipv6.ovn.ranges",
  ipv6_gateway: "ipv6.gateway",
  ipv6_routes: "ipv6.routes",
  ipv6_routes_anycast: "ipv6.routes.anycast",
  mtu: "mtu",
  network: "network",
  ovn_ingress_mode: "ovn.ingress_mode",
  parent: "parent",
  security_acls: "security.acls",
  vlan: "vlan",
};

export const getHandledNetworkConfigKeys = () => {
  return new Set(Object.values(networkFormFieldToPayloadName));
};

export const getNetworkKey = (formField: string): keyof LxdNetworkConfig => {
  if (!(formField in networkFormFieldToPayloadName)) {
    throw new Error(
      `Could not find ${formField} in networkFormFieldToPayloadName`,
    );
  }
  return networkFormFieldToPayloadName[formField];
};

const networkTypeToOptionKey: Record<string, LxdConfigOptionsKeys> = {
  bridge: "network-bridge",
  ovn: "network-ovn",
  macvlan: "network-macvlan",
  physical: "network-physical",
  sriov: "network-sriov",
};

export const networkFormTypeToOptionKey = (
  type: string,
): LxdConfigOptionsKeys => {
  if (!(type in networkTypeToOptionKey)) {
    throw new Error(`Could not find ${type} in networkTypeToOptionKey`);
  }
  return networkTypeToOptionKey[type];
};

const hasNetworkConfigDiff = (
  a: Partial<LxdNetworkConfig>,
  b: Partial<LxdNetworkConfig>,
): boolean => {
  return (Object.keys(a) as Array<keyof typeof a>).some((key) => {
    const isIp = key === "ipv4.address" || key === "ipv6.address";
    if (isIp && a[key] === "auto" && b[key] !== "") {
      return false;
    }
    return a[key] !== b[key];
  });
};

export const areNetworksEqual = (
  a: Partial<LxdNetwork> & Required<Pick<LxdNetwork, "config">>,
  b: Partial<LxdNetwork> & Required<Pick<LxdNetwork, "config">>,
): boolean => {
  if (hasNetworkConfigDiff(a.config, b.config)) {
    return false;
  }

  const hasMainKeyDiff = (Object.keys(a) as Array<keyof typeof a>).some(
    (key) => (key === "config" || key === "etag" ? false : a[key] !== b[key]),
  );

  return !hasMainKeyDiff;
};

export const testValidIp = (ip: string | null | undefined): boolean => {
  const expression =
    /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;

  if (!ip) {
    return false;
  }
  return expression.test(ip);
};

export const testValidPort = (port: string | null | undefined): boolean => {
  const expression =
    /^(([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])[-,]){0,9}([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;

  if (!port) {
    return true;
  }
  return expression.test(port);
};

export const renderNetworkType = (type: LxdNetwork["type"]) => {
  switch (type) {
    case ovnType:
      return "OVN";
    case sriovType:
      return "SR-IOV";
    default:
      return capitalizeFirstLetter(type);
  }
};
