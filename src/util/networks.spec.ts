import type { IpAddress, IpFamily } from "types/instance";
import {
  areNetworksEqual,
  isLocalIPv6,
  sortIpv6Addresses,
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

describe("sortIpv6Addresses", () => {
  const defaultFieldsV6 = {
    iface: "",
    family: "inet6" as IpFamily,
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
    const result = sortIpv6Addresses(ipv6Addresses);

    for (let i = 0; i < 17; i++) {
      expect(isLocalIPv6(result[i].address)).toBe(false);
    }
    for (let i = 17; i < result.length; i++) {
      expect(isLocalIPv6(result[i].address)).toBe(true);
    }
  });
});
