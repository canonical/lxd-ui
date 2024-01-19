import { areNetworksEqual, testValidIp, testValidPort } from "./networks";
import { LxdNetwork } from "types/network";

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
