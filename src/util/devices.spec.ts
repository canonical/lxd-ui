import React from "react";
import type { LxdDeviceValue, LxdNicDevice } from "types/device";
import { getDeviceAcls, getIndex, isNoneDevice, isValidIPV6 } from "./devices";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import type { FormDevice } from "types/formDevice";
import { describe, it, expect } from "vitest";
import { getNicIpDisableReason } from "util/devices";
import type {
  LxdNetwork,
  LxdNetworkConfig,
  LxdNetworkType,
} from "types/network";
import type { NetworkDeviceFormValues } from "types/forms/networkDevice";
import { typesWithNicStaticIPSupport } from "./networks";

export const extractComponentText = (component: React.ReactNode): string => {
  if (!component) return "";
  const props = (component as React.ReactElement)
    .props as React.PropsWithChildren;
  const children = props.children;
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children
      .map((child: unknown) => {
        if (React.isValidElement(child as object)) {
          return extractComponentText(child as React.ReactElement);
        }
        if (typeof child === "string" || typeof child === "number") {
          return String(child);
        }
        return "";
      })
      .join("");
  }
  if (React.isValidElement(children as object)) {
    return extractComponentText(children as React.ReactElement);
  }
  return "";
};

describe("isNoneDevice", () => {
  it("should return true for a 'none' device", () => {
    const noneDevice: LxdDeviceValue = {
      type: "none",
    };
    expect(isNoneDevice(noneDevice)).toBe(true);
  });

  test.each([
    { type: "proxy", listen: "tcp:0.0.0.0:80" },
    { type: "other", someProp: "value" },
    {
      type: "nic",
      network: "lxdbr0",
    },
    {
      type: "disk",
      path: "/dev/sda",
    },
  ])("should return false for device type $type", (device) => {
    expect(isNoneDevice(device as LxdDeviceValue)).toBe(false);
  });
});

describe("getDeviceAcls", () => {
  it("should return an empty array when device is undefined", () => {
    expect(getDeviceAcls(undefined)).toEqual([]);
  });

  it("should return an empty array when device is null", () => {
    expect(getDeviceAcls(null)).toEqual([]);
  });

  it("should return an empty array when security.acls is not in device", () => {
    const device: LxdNicDevice = {
      name: "eth0",
      type: "nic",
      network: "network-name",
    };
    expect(getDeviceAcls(device)).toEqual([]);
  });

  it("should return an empty array when security.acls is an empty string", () => {
    const device: LxdNicDevice = {
      "security.acls": "",
      type: "nic",
      network: "network-name",
    };
    expect(getDeviceAcls(device)).toEqual([]);
  });

  it("should return an array with a single acl when security.acls has one value", () => {
    const device: LxdNicDevice = {
      "security.acls": "default",
      type: "nic",
      network: "network-name",
    };
    expect(getDeviceAcls(device)).toEqual(["default"]);
  });

  it("should return an array of acls when security.acls has multiple values", () => {
    const device: LxdNicDevice = {
      "security.acls": "default,test-acl,production-acl",
      type: "nic",
      network: "network-name",
    };
    expect(getDeviceAcls(device)).toEqual([
      "default",
      "test-acl",
      "production-acl",
    ]);
  });

  it("should filter out empty strings from the acl list", () => {
    const device: LxdNicDevice = {
      "security.acls": "default,,test-acl,   ,production-acl,",
      type: "nic",
      network: "network-name",
    };
    // Note: The current implementation does not trim whitespace.
    expect(getDeviceAcls(device)).toEqual([
      "default",
      "test-acl",
      "   ",
      "production-acl",
    ]);
  });

  it("should correctly filter out only truly empty strings from trailing/double commas", () => {
    const device: LxdNicDevice = {
      "security.acls": "acl1,acl2,,acl3,",
      type: "nic",
      network: "network-name",
    };
    expect(getDeviceAcls(device)).toEqual(["acl1", "acl2", "acl3"]);
  });
});

describe("getIndex", () => {
  const mockDevice1: FormDevice = {
    name: "eth0",
    type: "nic",
    network: "lxdbr0",
  };
  const mockDevice2: FormDevice = {
    name: "eth1",
    type: "nic",
    network: "lxdbr1",
  };
  const mockDevice3: FormDevice = {
    name: "eth2",
    type: "nic",
    network: "lxdbr2",
  };

  const createMockFormik = (devices: FormDevice[]) =>
    ({
      values: {
        devices: devices,
      },
    }) as InstanceAndProfileFormikProps;

  it("returns -1 if formik is not provided", () => {
    expect(getIndex("eth0", undefined)).toBe(-1);
  });

  it("returns the correct index when the device exists in the array", () => {
    const mockFormik = createMockFormik([
      mockDevice1,
      mockDevice2,
      mockDevice3,
    ]);
    expect(getIndex(mockDevice2.name, mockFormik)).toBe(1);
  });

  it("returns -1 if the device does not exist in the array", () => {
    const mockFormik = createMockFormik([mockDevice1, mockDevice3]);
    expect(getIndex(mockDevice2.name, mockFormik)).toBe(-1);
  });

  it("returns -1 when the devices array is empty", () => {
    const mockFormik = createMockFormik([]);
    expect(getIndex(mockDevice1.name, mockFormik)).toBe(-1);
  });
});

describe("isValidIPV6", () => {
  it("should return true for valid IPv6 addresses", () => {
    expect(isValidIPV6("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
    expect(isValidIPV6("2001:db8::1")).toBe(true);
    expect(isValidIPV6("fe80::1ff:fe23:4567:890a")).toBe(true);
  });

  it("should return false for invalid IPv6 addresses", () => {
    expect(isValidIPV6("2001:0db8:85a3::8a2e:0370:7334:")).toBe(false);
    expect(isValidIPV6("2001:db8:::1")).toBe(false);
    expect(isValidIPV6("fe80::1ff::fe23:4567:890a")).toBe(false);
    expect(isValidIPV6("fe80::1ff::fe23:4567:MMMM")).toBe(false);
    expect(isValidIPV6("not-an-ip")).toBe(false);
    expect(isValidIPV6("12345::")).toBe(false);
  });
});

describe("getNicIpDisableReason", () => {
  const mockNetwork = (
    name: string,
    type: LxdNetworkType,
    managed = true,
    status: string = "Created" as const,
    config: LxdNetworkConfig = {},
  ): LxdNetwork => ({
    name,
    type,
    managed,
    config,
    status,
  });

  const mockNetworkFormValues = (ipv4 = ""): NetworkDeviceFormValues => ({
    name: "test-network",
    ipv4: ipv4,
    network: "lxdbr0",
  });

  describe("general validation", () => {
    it("should reject unsupported network types", () => {
      const network = mockNetwork("test", "physical");
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv4");
      expect(extractComponentText(result)).toBe(
        `Network must be of type ${typesWithNicStaticIPSupport.join(" or ")}.`,
      );
    });

    it("should reject unmanaged networks", () => {
      const network = mockNetwork("test", "bridge", false);
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv4");
      expect(extractComponentText(result)).toBe("Network is not managed.");
    });

    it("should reject networks not in Created state", () => {
      const network = mockNetwork("test", "bridge", true, "Pending");
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv4");
      expect(extractComponentText(result)).toBe(
        "Network is not in status created.",
      );
    });
  });

  describe("bridge network - IPv4", () => {
    it("should reject when DHCP is disabled", () => {
      const network = mockNetwork("test", "bridge", true, "Created", {
        "ipv4.dhcp": "false",
        "ipv4.address": "10.0.0.1/24",
      });
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv4");
      expect(extractComponentText(result)).toBe(
        "IPv4 DHCP is disabled on the selected network.",
      );
    });

    it("should reject when network CIDR is 'none'", () => {
      const network = mockNetwork("test", "bridge", true, "Created", {
        "ipv4.dhcp": "true",
        "ipv4.address": "none",
      });
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv4");
      expect(extractComponentText(result)).toBe(
        "IPv4 is disabled on the selected network",
      );
    });

    it("should reject when network CIDR is undefined", () => {
      const network = mockNetwork("test", "bridge", true, "Created", {
        "ipv4.dhcp": "true",
      });
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv4");
      expect(extractComponentText(result)).toBe(
        "IPv4 is disabled on the selected network",
      );
    });

    it("should allow when all requirements are met with default DHCP", () => {
      const network = mockNetwork("test", "bridge", true, "Created", {
        "ipv4.address": "10.0.0.1/24",
      });
      const formValues = mockNetworkFormValues();
      const defaultDhcp = "true";
      const result = getNicIpDisableReason(
        formValues,
        network,
        "IPv4",
        defaultDhcp,
      );
      expect(result).toBeNull();
    });
  });

  describe("bridge network - IPv6", () => {
    it("should reject when DHCP is disabled", () => {
      const network = mockNetwork("test", "bridge", true, "Created", {
        "ipv6.dhcp": "false",
        "ipv6.address": "fd00::1/64",
      });
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv6");
      expect(extractComponentText(result)).toBe(
        "IPv6 DHCP or IPv6 DHCP stateful are disabled on the selected network.",
      );
    });

    it("should reject when DHCPv6 stateful is disabled", () => {
      const network = mockNetwork("test", "bridge", true, "Created", {
        "ipv6.dhcp": "true",
        "ipv6.dhcp.stateful": "false",
        "ipv6.address": "fd00::1/64",
      });
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv6");
      expect(extractComponentText(result)).toBe(
        "IPv6 DHCP or IPv6 DHCP stateful are disabled on the selected network.",
      );
    });

    it("should reject when no valid override is provided for DHCP stateful", () => {
      const network = mockNetwork("test", "bridge", true, "Created", {
        "ipv6.dhcp": "true",
        "ipv6.address": "fd00::1/64",
      });
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv6");
      expect(extractComponentText(result)).toBe(
        "IPv6 DHCP or IPv6 DHCP stateful are disabled on the selected network.",
      );
    });

    it("should reject when network CIDR is 'none'", () => {
      const network = mockNetwork("test", "bridge", true, "Created", {
        "ipv6.dhcp": "true",
        "ipv6.address": "none",
      });
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv6");
      expect(extractComponentText(result)).toBe(
        "IPv6 is disabled on the selected network",
      );
    });

    it("should reject when network CIDR is undefined", () => {
      const network = mockNetwork("test", "bridge", true, "Created", {
        "ipv6.dhcp": "true",
      });
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv6");
      expect(extractComponentText(result)).toBe(
        "IPv6 is disabled on the selected network",
      );
    });

    it("should allow when all requirements are met with default DHCP stateful", () => {
      const network = mockNetwork("test", "bridge", true, "Created", {
        "ipv6.dhcp.stateful": "true",
        "ipv6.address": "fd00::1/64",
      });
      const formValues = mockNetworkFormValues();
      const defaultDhcp = "true";
      const defaultDhcpStateful = "true";

      const result = getNicIpDisableReason(
        formValues,
        network,
        "IPv6",
        defaultDhcp,
        defaultDhcpStateful,
      );
      expect(result).toBeNull();
    });
  });

  describe("OVN network - IPv4", () => {
    it("should reject when DHCP is disabled", () => {
      const network = mockNetwork("test", "ovn", true, "Created", {
        "ipv4.dhcp": "false",
        "ipv4.address": "10.0.0.1/24",
      });
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv4");
      expect(extractComponentText(result)).toBe(
        "IPv4 DHCP is disabled on the selected network.",
      );
    });

    it("should allow when all requirements are met with default DHCP", () => {
      const network = mockNetwork("test", "ovn", true, "Created", {
        "ipv4.address": "10.0.0.1/24",
      });
      const formValues = mockNetworkFormValues();
      const defaultDhcp = "true";
      const result = getNicIpDisableReason(
        formValues,
        network,
        "IPv4",
        defaultDhcp,
      );
      expect(result).toBeNull();
    });
  });

  describe("OVN network - IPv6", () => {
    it("should reject when DHCP is disabled", () => {
      const network = mockNetwork("test", "ovn", true, "Created", {
        "ipv6.dhcp": "false",
        "ipv6.address": "fd00::1/64",
      });
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv6");
      expect(extractComponentText(result)).toBe(
        "IPv6 DHCP or IPv6 DHCP stateful are disabled on the selected network.",
      );
    });

    it("should reject when DHCP stateful is disabled", () => {
      const network = mockNetwork("test", "ovn", true, "Created", {
        "ipv6.dhcp": "true",
        "ipv6.address": "fd00::1/64",
        "ipv6.dhcp.stateful": "false",
      });
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv6");
      expect(extractComponentText(result)).toBe(
        "IPv6 DHCP or IPv6 DHCP stateful are disabled on the selected network.",
      );
    });

    it("should reject when no valid override is provided for DHCP stateful", () => {
      const network = mockNetwork("test", "ovn", true, "Created", {
        "ipv6.dhcp": "true",
        "ipv6.address": "fd00::1/64",
      });
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv6");
      expect(extractComponentText(result)).toBe(
        "IPv6 DHCP or IPv6 DHCP stateful are disabled on the selected network.",
      );
    });

    it("should reject when nic static IPv4 is undefined", () => {
      const network = mockNetwork("test", "ovn", true, "Created", {
        "ipv6.dhcp": "true",
        "ipv6.dhcp.stateful": "true",
        "ipv6.address": "fd00::1/64",
      });
      const formValues = mockNetworkFormValues();
      const result = getNicIpDisableReason(formValues, network, "IPv6");
      expect(extractComponentText(result)).toBe(
        "IPv4 address reservation must be set to enable this field.",
      );
    });

    it("should reject when IPv4 address is nic static IPv4 is 'none'", () => {
      const network = mockNetwork("test", "ovn", true, "Created", {
        "ipv6.dhcp": "true",
        "ipv6.dhcp.stateful": "true",
        "ipv6.address": "fd00::1/64",
      });
      const formValues = mockNetworkFormValues("none");
      const result = getNicIpDisableReason(formValues, network, "IPv6");
      expect(extractComponentText(result)).toBe(
        "IPv4 address reservation must be set to enable this field.",
      );
    });

    it("should allow when all requirements are met with default DHCP stateful", () => {
      const network = mockNetwork("test", "ovn", true, "Created", {
        "ipv6.dhcp.stateful": "true",
        "ipv6.address": "fd00::1/64",
      });
      const formValues = mockNetworkFormValues("10.0.0.1");
      const defaultDhcp = "true";
      const defaultDhcpStateful = "true";
      const result = getNicIpDisableReason(
        formValues,
        network,
        "IPv6",
        defaultDhcp,
        defaultDhcpStateful,
      );
      expect(result).toBeNull();
    });
  });
});
