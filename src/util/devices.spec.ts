import type { LxdNicDevice } from "types/device";
import { getDeviceAcls, getIndex } from "./devices";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import type { FormDevice } from "./formDevices";

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
    const mockDevice: LxdNicDevice = {
      name: "eth0",
      type: "nic",
      network: "lxdbr0",
    };
    expect(getIndex(mockDevice, undefined)).toBe(-1);
  });

  it("returns the correct index when the device exists in the array", () => {
    const mockFormik = createMockFormik([
      mockDevice1,
      mockDevice2,
      mockDevice3,
    ]);
    expect(getIndex(mockDevice2 as LxdNicDevice, mockFormik)).toBe(1);
  });

  it("returns -1 if the device does not exist in the array", () => {
    const mockFormik = createMockFormik([mockDevice1, mockDevice3]);
    expect(getIndex(mockDevice2 as LxdNicDevice, mockFormik)).toBe(-1);
  });

  it("returns -1 when the devices array is empty", () => {
    const mockFormik = createMockFormik([]);
    expect(getIndex(mockDevice1 as LxdNicDevice, mockFormik)).toBe(-1);
  });
});
