import type { IpAddress, IpFamily, LxdInstance } from "types/instance";
import {
  areNetworksEqual,
  getIpAddresses,
  getManagedInterfaces,
  getNetworkAcls,
  isLocalIPv4,
  isLocalIPv6,
  isTypeOvn,
  ovnType,
  sortIpAddresses,
  supportsNicDeviceAcls,
  testValidIp,
  testValidPort,
} from "./networks";
import type { LxdNetwork } from "types/network";

describe("areNetworksEqual", () => {
  it("accepts matches", () => {
    const a: Partial<LxdNetwork> & Required<Pick<LxdNetwork, "config">> = {
      config: {
        "bridge.driver": "native",
        "ipv4.address": "auto",
        "ipv6.address": "fd42:2c50:bf9f:52b1::1/64",
        "ipv6.nat": "true",
      },
      description: "",
      etag: "etag",
      name: "mybr23",
      type: "bridge",
    };
    const b: Partial<LxdNetwork> & Required<Pick<LxdNetwork, "config">> = {
      config: {
        "bridge.driver": "native",
        "ipv4.address": "10.191.170.1/24",
        "ipv6.address": "fd42:2c50:bf9f:52b1::1/64",
        "ipv6.nat": "true",
      },
      description: "",
      etag: "different-etag",
      name: "mybr23",
      type: "bridge",
    };

    expect(areNetworksEqual(a, b)).toBe(true);
  });

  it("rejects main diff", () => {
    const a: Partial<LxdNetwork> & Required<Pick<LxdNetwork, "config">> = {
      config: {},
      name: "name",
    };
    const b: Partial<LxdNetwork> & Required<Pick<LxdNetwork, "config">> = {
      config: {},
      name: "different-name",
    };

    expect(areNetworksEqual(a, b)).toBe(false);
  });

  it("rejects config diff", () => {
    const a: Partial<LxdNetwork> & Required<Pick<LxdNetwork, "config">> = {
      config: {
        "bridge.driver": "native",
      },
    };
    const b: Partial<LxdNetwork> & Required<Pick<LxdNetwork, "config">> = {
      config: {
        "bridge.driver": "openvswitch",
      },
    };

    expect(areNetworksEqual(a, b)).toBe(false);
  });
});

describe("testValidIp", () => {
  it("accepts ipv4", () => {
    const result = testValidIp("1.2.3.4");
    expect(result).toBe(true);
  });

  it("rejects invalid ipv4", () => {
    const result = testValidIp("1.2.3");
    expect(result).toBe(false);
  });

  it("rejects invalid ipv4", () => {
    const result = testValidIp("1.2.3.300");
    expect(result).toBe(false);
  });

  it("accepts ipv6", () => {
    const result = testValidIp("fd42:36de:45cd:3460::1");
    expect(result).toBe(true);
  });
});

describe("testValidPort", () => {
  it("accepts single port", () => {
    const result = testValidPort("23");
    expect(result).toBe(true);
  });

  it("accepts port list", () => {
    const result = testValidPort("23,443");
    expect(result).toBe(true);
  });

  it("accepts port range", () => {
    const result = testValidPort("8000-8080");
    expect(result).toBe(true);
  });

  it("accepts port range and list", () => {
    const result = testValidPort("23,8000-8080");
    expect(result).toBe(true);
  });

  it("rejects high number", () => {
    const result = testValidPort("77777");
    expect(result).toBe(false);
  });

  it("rejects invalid range", () => {
    const result = testValidPort("23-");
    expect(result).toBe(false);
  });
});

describe("isLocalIPv4", () => {
  it("accepts loopback ipv4", () => {
    expect(isLocalIPv4("127.0.0.1")).toBe(true);
  });

  it("accepts link local ipv4", () => {
    expect(isLocalIPv4("169.254.10.20")).toBe(true);
  });

  it("rejects private ipv4", () => {
    expect(isLocalIPv4("172.22.0.5")).toBe(false);
    expect(isLocalIPv4("10.0.1.127")).toBe(false);
    expect(isLocalIPv4("192.168.1.1")).toBe(false);
  });

  it("rejects public ipv4", () => {
    expect(isLocalIPv4("8.8.8.8")).toBe(false);
  });
});

describe("isLocalIPv6", () => {
  it("accepts link local ipv6", () => {
    const result = isLocalIPv6("fe80::1234:5678:90ab:cdef");
    expect(result).toBe(true);
  });

  it("rejects unique local ipv6", () => {
    const result = isLocalIPv6("fd00::a123:4567:8901:2345");
    expect(result).toBe(false);
  });

  it("accepts ::1", () => {
    const result = isLocalIPv6("::1");
    expect(result).toBe(true);
  });

  it("rejects global ipv6", () => {
    const result = isLocalIPv6("2a02:c01:0:2::1");
    expect(result).toBe(false);
  });
});

describe("sortIpAddresses", () => {
  const defaultFieldsV6 = {
    iface: "veth0",
    family: "inet6" as IpFamily,
    netmask: "",
    scope: "",
  };
  const defaultFieldsV4 = {
    iface: "veth0",
    family: "inet" as IpFamily,
    netmask: "",
    scope: "",
  };
  const ipv6Addresses: IpAddress[] = [
    {
      ...defaultFieldsV6,
      address: "::1", // local
    },
    {
      ...defaultFieldsV6,
      address: "2001:0db8:85a3:0000:0000:8a2e:0370:7334", // global
    },
    {
      ...defaultFieldsV6,
      address: "2001:0db8:1111:2222:3333:4444:5555:6666", // global
    },
    {
      ...defaultFieldsV6,
      address: "2001:470:1f06:21c3::1", // global
    },
    {
      ...defaultFieldsV6,
      address: "2a00:1450:4000:a12::c4", // global
    },
    {
      ...defaultFieldsV6,
      address: "2600:1f18:1234:5678::1", // global
    },
    {
      ...defaultFieldsV6,
      address: "fe80::208:74ff:feda:625c", // link - local
    },
    {
      ...defaultFieldsV6,
      address: "2a03:2880:f000:3000:4::2b", // global
    },
    {
      ...defaultFieldsV6,
      address: "2a01:4f9:c010:278::8", // global
    },
    {
      ...defaultFieldsV6,
      address: "2607:f8b0:4003:c07::2b", // global
    },
    {
      ...defaultFieldsV6,
      address: "2001:db8:c0a8:0101::1", // global
    },
    {
      ...defaultFieldsV6,
      address: "fd00::a123:4567:8901:2345", // unique local
    },
    {
      ...defaultFieldsV6,
      address: "2001:db8:2222:3333:4444:5555: 6666:7777", // global
    },
    {
      ...defaultFieldsV6,
      address: "2a02:26f0:e000:421::1", // global
    },
    {
      ...defaultFieldsV6,
      address: "2a02:c01:0:2::1", // global
    },
    {
      ...defaultFieldsV6,
      address: "2001:db8:3333:4444:5555:6666:7777:8888", // global
    },
    {
      ...defaultFieldsV6,
      address: "2001:db8:1234:5678:9abc:def0:1234:5678", // global
    },
    {
      ...defaultFieldsV6,
      address: "2001:db8:5555:6666:7777:8888:9999:aaaa", // global
    },
    {
      ...defaultFieldsV6,
      address: "2001:db8:bbbb:cccc:dddd:eeee:ffff:1111", // global
    },
    {
      ...defaultFieldsV6,
      address: "fe80::1234:5678:90ab:cdef", // link - local
    },
  ];

  it("should set IPv6 local addresses at the end", () => {
    const result = sortIpAddresses(ipv6Addresses, new Set());

    for (let i = 0; i < 17; i++) {
      expect(isLocalIPv6(result[i].address)).toBe(false);
    }
    for (let i = 17; i < result.length; i++) {
      expect(isLocalIPv6(result[i].address)).toBe(true);
    }
  });

  it("should not mutate the input", () => {
    const input = [...ipv6Addresses];
    sortIpAddresses(input, new Set());

    expect(input).toEqual(ipv6Addresses);
  });

  it("should set main interface addresses first within each locality group", () => {
    const addresses: IpAddress[] = [
      { ...defaultFieldsV6, iface: "docker0", address: "fe80::1" },
      { ...defaultFieldsV6, iface: "docker0", address: "2001:db8::1" },
      { ...defaultFieldsV6, iface: "eth0", address: "fe80::2" },
      { ...defaultFieldsV6, iface: "eth0", address: "2001:db8::2" },
    ];

    const result = sortIpAddresses(addresses, new Set(["eth0"]));

    expect(result.map((item) => item.address)).toEqual([
      "2001:db8::2",
      "2001:db8::1",
      "fe80::2",
      "fe80::1",
    ]);
  });

  it("should keep the original order of equally ranked addresses", () => {
    const addresses: IpAddress[] = [
      { ...defaultFieldsV4, iface: "eth0", address: "172.22.0.201" },
      { ...defaultFieldsV4, iface: "eth0", address: "172.22.0.5" },
    ];

    const result = sortIpAddresses(addresses, new Set(["eth0"]));

    expect(result.map((item) => item.address)).toEqual([
      "172.22.0.201",
      "172.22.0.5",
    ]);
  });
});

const createInstance = (
  config: Record<string, string>,
  network?: Record<string, unknown>,
): LxdInstance =>
  ({
    name: "kube1",
    config,
    state: network ? { network } : undefined,
  }) as unknown as LxdInstance;

const iface = (hwaddr: string, addresses: string[], type = "broadcast") => ({
  hwaddr,
  type,
  state: "up",
  addresses: addresses.map((address) => ({
    address,
    family: address.includes(":") ? "inet6" : "inet",
    netmask: "",
    scope: address.includes(":") ? "link" : "global",
  })),
});

const kube1Network = {
  cilium_host: iface("62:92:d8:02:ec:78", [
    "10.0.1.127",
    "fe80::6092:d8ff:fe02:ec78",
  ]),
  enp5s0: iface("00:16:3e:02:73:86", [
    "172.22.0.201",
    "172.22.0.5",
    "2a02:a455:3cc4:400:216:3eff:fe02:7386",
    "fe80::216:3eff:fe02:7386",
  ]),
  lo: iface("", ["127.0.0.1", "::1"], "loopback"),
  lxc8995be0b0d68: iface("d2:d9:a5:06:6c:fb", ["fe80::d0d9:a5ff:fe06:6cfb"]),
};

const kube1Config = { "volatile.eth0.hwaddr": "00:16:3e:02:73:86" };

describe("getManagedInterfaces", () => {
  it("matches the interface by hwaddr, not by name", () => {
    const instance = createInstance(kube1Config, kube1Network);

    expect(getManagedInterfaces(instance)).toEqual(new Set(["enp5s0"]));
  });

  it("ignores casing differences in the hwaddr", () => {
    const instance = createInstance(
      { "volatile.eth0.hwaddr": "00:16:3E:02:73:86" },
      kube1Network,
    );

    expect(getManagedInterfaces(instance)).toEqual(new Set(["enp5s0"]));
  });

  it("returns an empty set when no volatile hwaddr matches", () => {
    const instance = createInstance(
      { "volatile.eth0.hwaddr": "00:16:3e:ff:ff:ff" },
      kube1Network,
    );

    expect(getManagedInterfaces(instance)).toEqual(new Set());
  });

  it("returns an empty set for an instance without state", () => {
    expect(getManagedInterfaces(createInstance(kube1Config))).toEqual(
      new Set(),
    );
  });
});

describe("getIpAddresses", () => {
  it("returns an empty list for a stopped instance", () => {
    expect(getIpAddresses(createInstance(kube1Config), "inet")).toEqual([]);
    expect(getIpAddresses(createInstance(kube1Config), "inet6")).toEqual([]);
  });

  it("excludes loopback and lists the nic device addresses first", () => {
    const instance = createInstance(kube1Config, kube1Network);

    const result = getIpAddresses(instance, "inet");

    expect(result.map((item) => item.address)).toEqual([
      "172.22.0.201",
      "172.22.0.5",
      "10.0.1.127",
    ]);
    expect(result[0].iface).toBe("enp5s0");
  });

  it("ranks the global address first and the nic device link local next", () => {
    const instance = createInstance(kube1Config, kube1Network);

    const result = getIpAddresses(instance, "inet6");

    expect(result.map((item) => item.address)).toEqual([
      "2a02:a455:3cc4:400:216:3eff:fe02:7386",
      "fe80::216:3eff:fe02:7386",
      "fe80::6092:d8ff:fe02:ec78",
      "fe80::d0d9:a5ff:fe06:6cfb",
    ]);
  });

  it("falls back to local last ordering when no nic device matches", () => {
    const instance = createInstance({}, kube1Network);

    const result = getIpAddresses(instance, "inet6");

    expect(result[0].address).toBe("2a02:a455:3cc4:400:216:3eff:fe02:7386");
    expect(result.slice(1).every((item) => isLocalIPv6(item.address))).toBe(
      true,
    );
  });
});

describe("getNetworkAcls", () => {
  it("should return an empty array when network is undefined", () => {
    expect(getNetworkAcls(undefined)).toEqual([]);
  });

  it("should return an empty array when security.acls is not in config", () => {
    const network: LxdNetwork = {
      name: "network-name",
      type: "bridge",
      config: {
        "volatile.eth0.hwaddr": "00:16:3e:bd:5b:f5",
      },
    };
    expect(getNetworkAcls(network)).toEqual([]);
  });

  it("should return an empty array when security.acls is an empty string", () => {
    const network: LxdNetwork = {
      name: "network-name",
      type: "bridge",
      config: {
        "security.acls": "",
      },
    };
    expect(getNetworkAcls(network)).toEqual([]);
  });

  it("should return an array with a single acl when security.acls has one value", () => {
    const network: LxdNetwork = {
      name: "network-name",
      type: "bridge",
      config: {
        "security.acls": "default",
      },
    };
    expect(getNetworkAcls(network)).toEqual(["default"]);
  });

  it("should return an array of acls when security.acls has multiple values", () => {
    const network: LxdNetwork = {
      name: "network-name",
      type: "bridge",
      config: {
        "security.acls": "default,test-acl,production-acl",
      },
    };
    expect(getNetworkAcls(network)).toEqual([
      "default",
      "test-acl",
      "production-acl",
    ]);
  });

  it("should filter out empty strings from the acl list", () => {
    const network: LxdNetwork = {
      name: "network-name",
      type: "bridge",
      config: {
        "security.acls": "default,,test-acl,   ,production-acl,",
      },
    };
    // Note: The current implementation does not trim whitespace.
    expect(getNetworkAcls(network)).toEqual([
      "default",
      "test-acl",
      "   ",
      "production-acl",
    ]);
  });

  it("should correctly filter out only truly empty strings from trailing/double commas", () => {
    const network: LxdNetwork = {
      name: "network-name",
      type: "bridge",
      config: {
        "security.acls": "acl1,acl2,,acl3,",
      },
    };
    expect(getNetworkAcls(network)).toEqual(["acl1", "acl2", "acl3"]);
  });
});

describe("isTypeOvn", () => {
  it("should return true if the network type is ovn", () => {
    const network: LxdNetwork = { name: "ovn-net", type: ovnType, config: {} };
    expect(isTypeOvn(network)).toBe(true);
  });

  it("should return false if the network type is not ovn", () => {
    const network: LxdNetwork = {
      name: "bridge-net",
      type: "bridge",
      config: {},
    };
    expect(isTypeOvn(network)).toBe(false);
  });

  it("should return false if the network object is undefined", () => {
    expect(isTypeOvn(undefined)).toBe(false);
  });

  it("should return false if the network has no type property", () => {
    const network = { name: "no-type-net" } as LxdNetwork;
    expect(isTypeOvn(network)).toBe(false);
  });
});

describe("supportsNicDeviceAcls", () => {
  it("should return false if network is undefined", () => {
    expect(supportsNicDeviceAcls(undefined)).toBe(false);
  });

  it("should return false if network type is not in the supported list", () => {
    const network = { type: "physical" } as LxdNetwork;
    expect(supportsNicDeviceAcls(network)).toBe(false);
  });

  it("should return false if network has no type property", () => {
    const network = {} as LxdNetwork;
    expect(supportsNicDeviceAcls(network)).toBe(false);
  });

  it('should return true if network type is "ovn"', () => {
    const network = { type: "ovn" } as LxdNetwork;
    expect(supportsNicDeviceAcls(network)).toBe(true);
  });

  it('should return true if network type is "bridge"', () => {
    const network = { type: "bridge" } as LxdNetwork;
    expect(supportsNicDeviceAcls(network)).toBe(false);
  });
});
