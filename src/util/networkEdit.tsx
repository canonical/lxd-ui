import { LxdNetwork } from "types/network";

export const getNetworkEditValues = (network: LxdNetwork) => {
  return {
    name: network.name,
    description: network.description,
    type: network.type,
    bridge_driver: network.config["bridge.driver"],
    bridge_external_interfaces: network.config["bridge.external_interfaces"],
    bridge_hwaddr: network.config["bridge.hwaddr"],
    bridge_mode: network.config["bridge.mode"],
    bridge_mtu: network.config["bridge.mtu"],
    dns_domain: network.config["dns.domain"],
    dns_mode: network.config["dns.mode"],
    dns_search: network.config["dns.search"],
    dns_zone_forward: network.config["dns.zone.forward"],
    dns_zone_reverse_ipv4: network.config["dns.zone.reverse.ipv4"],
    dns_zone_reverse_ipv6: network.config["dns.zone.reverse.ipv6"],
    fan_type: network.config["fan.type"],
    fan_overlay_subnet: network.config["fan.overlay_subnet"],
    fan_underlay_subnet: network.config["fan.underlay_subnet"],
    ipv4_address: network.config["ipv4.address"],
    ipv4_dhcp: network.config["ipv4.dhcp"],
    ipv4_dhcp_expiry: network.config["ipv4.dhcp.expiry"],
    ipv4_dhcp_gateway: network.config["ipv4.dhcp.gateway"],
    ipv4_dhcp_ranges: network.config["ipv4.dhcp.ranges"],
    ipv4_firewall: network.config["ipv4.firewall"],
    ipv4_l3only: network.config["ipv4.l3only"],
    ipv4_nat: network.config["ipv4.nat"],
    ipv4_nat_address: network.config["ipv4.nat.address"],
    ipv4_nat_order: network.config["ipv4.nat.order"],
    ipv4_ovn_ranges: network.config["ipv4.ovn.ranges"],
    ipv4_routes: network.config["ipv4.routes"],
    ipv4_routing: network.config["ipv4.routing"],
    ipv6_address: network.config["ipv6.address"],
    ipv6_dhcp: network.config["ipv6.dhcp"],
    ipv6_dhcp_expiry: network.config["ipv6.dhcp.expiry"],
    ipv6_dhcp_ranges: network.config["ipv6.dhcp.ranges"],
    ipv6_dhcp_stateful: network.config["ipv6.dhcp.stateful"],
    ipv6_firewall: network.config["ipv6.firewall"],
    ipv6_l3only: network.config["ipv6.l3only"],
    ipv6_nat: network.config["ipv6.nat"],
    ipv6_nat_address: network.config["ipv6.nat.address"],
    ipv6_nat_order: network.config["ipv6.nat.order"],
    ipv6_ovn_ranges: network.config["ipv6.ovn.ranges"],
    ipv6_ovn_routes: network.config["ipv6.ovn.routes"],
    ipv6_ovn_routing: network.config["ipv6.ovn.routing"],
    user: Object.entries(network.config)
      .filter(([key]) => key.startsWith("user."))
      .map(([key, value]) => {
        return { key: key.slice("user.".length), value };
      }),
  };
};
