import type { LxdNicDevice } from "types/device";
import { getDeviceAcls } from "./devices";

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
