import { LxdInstance } from "types/instance";
import { LxdNetwork, LxdNetworkConfig } from "types/network";
import { ConfigRowMetadata } from "util/configInheritance";

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

const networkDefaults: Record<string, string> = {
  bridge_driver: "native",
  bridge_hwaddr: "-",
  bridge_mtu: "1500",
  dns_domain: "lxd",
  dns_mode: "managed",
  dns_search: "-",
  ipv4_address: "auto",
  ipv4_dhcp: "true",
  ipv4_dhcp_expiry: "1h",
  ipv4_dhcp_ranges: "all addresses",
  ipv4_l3only: "false",
  ipv4_nat: "true",
  ipv4_nat_address: "-",
  ipv4_ovn_ranges: "-",
  ipv6_address: "auto",
  ipv6_dhcp: "true",
  ipv6_dhcp_expiry: "1h",
  ipv6_dhcp_ranges: "all addresses",
  ipv6_dhcp_stateful: "false",
  ipv6_l3only: "false",
  ipv6_nat: "true",
  ipv6_nat_address: ".",
  ipv6_ovn_ranges: "-",
};

export const getNetworkDefault = (formField: string): ConfigRowMetadata => {
  if (Object.keys(networkDefaults).includes(formField)) {
    return { value: networkDefaults[formField], source: "LXD" };
  }
  return { value: "", source: "LXD" };
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
