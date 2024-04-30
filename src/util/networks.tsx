import { LxdInstance } from "types/instance";
import { LxdNetwork, LxdNetworkConfig } from "types/network";
import { LxdConfigOptionsKeys } from "types/config";

export const getIpAddresses = (
  instance: LxdInstance,
  family: "inet" | "inet6",
) => {
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

export const networkFormFieldToPayloadName: Record<
  string,
  keyof LxdNetworkConfig
> = {
  bridge_driver: "bridge.driver",
  bridge_hwaddr: "bridge.hwaddr",
  bridge_mtu: "bridge.mtu",
  dns_domain: "dns.domain",
  dns_mode: "dns.mode",
  dns_search: "dns.search",
  ipv4_address: "ipv4.address",
  ipv4_dhcp: "ipv4.dhcp",
  ipv4_dhcp_expiry: "ipv4.dhcp.expiry",
  ipv4_dhcp_ranges: "ipv4.dhcp.ranges",
  ipv4_l3only: "ipv4.l3only",
  ipv4_nat: "ipv4.nat",
  ipv4_nat_address: "ipv4.nat.address",
  ipv4_ovn_ranges: "ipv4.ovn.ranges",
  ipv6_address: "ipv6.address",
  ipv6_dhcp: "ipv6.dhcp",
  ipv6_dhcp_expiry: "ipv6.dhcp.expiry",
  ipv6_dhcp_ranges: "ipv6.dhcp.ranges",
  ipv6_dhcp_stateful: "ipv6.dhcp.stateful",
  ipv6_l3only: "ipv6.l3only",
  ipv6_nat: "ipv6.nat",
  ipv6_nat_address: "ipv6.nat.address",
  ipv6_ovn_ranges: "ipv6.ovn.ranges",
  network: "network",
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
