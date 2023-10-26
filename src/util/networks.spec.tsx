import { areNetworksEqual } from "./networks";
import { LxdNetwork } from "types/network";

describe("areNetworksEqual", () => {
  it("accepts matches", () => {
    const a: Partial<LxdNetwork> & Required<Pick<LxdNetwork, "config">> = {
      config: {
        "bridge.mode": "standard",
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
        "bridge.mode": "standard",
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
        "bridge.mode": "standard",
      },
    };
    const b: Partial<LxdNetwork> & Required<Pick<LxdNetwork, "config">> = {
      config: {
        "bridge.mode": "fan",
      },
    };

    expect(areNetworksEqual(a, b)).toBe(false);
  });
});
