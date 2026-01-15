import {
  getImmutableAndEditable,
  getImmutableAndEditableOctets,
  getIpRangeFromCidr,
  isIpInSubnet,
  isIPv4,
} from "./subnetIpRange";

describe("isIPv4", () => {
  it("returns true for valid IPv4 addresses", () => {
    expect(isIPv4("192.168.1.1")).toBe(true);
    expect(isIPv4("255.255.255.255")).toBe(true);
    expect(isIPv4("0.0.0.0")).toBe(true);
  });
  it("returns false for invalid IPv4 addresses", () => {
    expect(isIPv4("256.256.256.256")).toBe(false);
    expect(isIPv4("192.168.1")).toBe(false);
    expect(isIPv4("abc.def.ghi.jkl")).toBe(false);
    expect(isIPv4("1234.123.123.123")).toBe(false);
  });
});

describe("getIpRangeFromCidr", () => {
  it("returns the start and end IP of a subnet", () => {
    expect(getIpRangeFromCidr("10.0.0.0/26")).toEqual([
      "10.0.0.1",
      "10.0.0.62",
    ]);

    expect(getIpRangeFromCidr("10.0.0.0/25")).toEqual([
      "10.0.0.1",
      "10.0.0.126",
    ]);

    expect(getIpRangeFromCidr("10.0.0.0/24")).toEqual([
      "10.0.0.1",
      "10.0.0.254",
    ]);

    expect(getIpRangeFromCidr("10.0.0.0/23")).toEqual([
      "10.0.0.1",
      "10.0.1.254",
    ]);

    expect(getIpRangeFromCidr("10.0.0.0/22")).toEqual([
      "10.0.0.1",
      "10.0.3.254",
    ]);
  });
});

describe("isIpInSubnet", () => {
  it("returns true if an IP is in a subnet", () => {
    expect(isIpInSubnet("10.0.0.1", "10.0.0.0/24")).toBe(true);
    expect(isIpInSubnet("10.0.0.254", "10.0.0.0/24")).toBe(true);
    expect(isIpInSubnet("192.168.0.1", "192.168.0.0/24")).toBe(true);
    expect(isIpInSubnet("192.168.0.254", "192.168.0.0/24")).toBe(true);
    expect(isIpInSubnet("192.168.1.1", "192.168.0.0/23")).toBe(true);
  });

  it("returns false if an IP is not in a subnet", () => {
    expect(isIpInSubnet("10.0.1.0", "10.0.0.0/24")).toBe(false);
    expect(isIpInSubnet("10.1.0.0", "10.0.0.0/24")).toBe(false);
    expect(isIpInSubnet("11.0.0.0", "10.0.0.0/24")).toBe(false);
    expect(isIpInSubnet("192.168.1.255", "192.168.0.0/23")).toBe(false);
    expect(isIpInSubnet("10.0.0.1", "192.168.0.0/24")).toBe(false);
    expect(isIpInSubnet("192.168.2.1", "192.168.0.0/24")).toBe(false);
    expect(isIpInSubnet("172.16.0.1", "192.168.0.0/24")).toBe(false);
  });

  it("returns false for the network and broadcast addresses", () => {
    expect(isIpInSubnet("10.0.0.0", "10.0.0.0/24")).toBe(false);
    expect(isIpInSubnet("10.0.0.255", "10.0.0.0/24")).toBe(false);
  });
});

describe("getImmutableAndEditableOctets", () => {
  it("returns the immutable and editable octets for a given subnet range", () => {
    expect(getImmutableAndEditableOctets("10.0.0.1", "10.0.0.254")).toEqual([
      "10.0.0",
      "[1-254]",
    ]);
    expect(getImmutableAndEditableOctets("10.0.0.1", "10.0.255.254")).toEqual([
      "10.0",
      "[0-255].[1-254]",
    ]);
    expect(getImmutableAndEditableOctets("10.0.0.1", "10.255.255.254")).toEqual(
      ["10", "[0-255].[0-255].[1-254]"],
    );
    expect(getImmutableAndEditableOctets("10.0.0.1", "20.255.255.254")).toEqual(
      ["", "[10-20].[0-255].[0-255].[1-254]"],
    );
  });
});

describe("getImmutableAndEditable", () => {
  it("returns the immutable and editable parts of an IPv4 subnet", () => {
    expect(getImmutableAndEditable("10.0.0.0/24")).toEqual([
      "10.0.0",
      "[1-254]",
    ]);
    expect(getImmutableAndEditable("192.168.1.0/24")).toEqual([
      "192.168.1",
      "[1-254]",
    ]);
    expect(getImmutableAndEditable("192.168.0.0/23")).toEqual([
      "192.168",
      "[0-1].[1-254]",
    ]);
    expect(getImmutableAndEditable("172.16.0.0/12")).toEqual([
      "172",
      "[16-31].[0-255].[1-254]",
    ]);
  });

  it("returns the immutable and editable parts of an IPv6 subnet", () => {
    expect(getImmutableAndEditable("2001:0db8:85a3::/64")).toEqual([
      "2001:0db8:85a3:",
      "0000:0000:0000:0000:0000",
    ]);
    expect(getImmutableAndEditable("fd00:1234:5678::/48")).toEqual([
      "fd00:1234:5678:",
      "0000:0000:0000:0000:0000",
    ]);
    expect(getImmutableAndEditable("fe80::/10")).toEqual([
      "fe80:",
      "0000:0000:0000:0000:0000:0000:0000",
    ]);
  });
});
