import { getDeviceVolumeInstanceCount } from "./volumeUsage";
import type { LxdDiskDevice } from "types/device";
import type { LxdProfile } from "types/profile";
import type { LxdStorageVolume } from "types/storage";

const device: LxdDiskDevice = {
  type: "disk",
  pool: "default",
  source: "data-vol",
  path: "/data",
};

const getVolume = (
  usedBy: string[],
  overrides: Partial<LxdStorageVolume> = {},
): LxdStorageVolume =>
  ({
    name: "data-vol",
    pool: "default",
    type: "custom",
    used_by: usedBy,
    ...overrides,
  }) as LxdStorageVolume;

const getProfile = (
  name: string,
  usedBy: string[],
  project = "default",
): LxdProfile => ({ name, project, used_by: usedBy }) as unknown as LxdProfile;

describe("getDeviceVolumeInstanceCount", () => {
  it("counts instances using the volume directly", () => {
    const volumes = [getVolume(["/1.0/instances/web", "/1.0/instances/db"])];
    expect(getDeviceVolumeInstanceCount(device, volumes, [])).toBe(2);
  });

  it("ignores instance snapshots in used_by", () => {
    const volumes = [
      getVolume(["/1.0/instances/web", "/1.0/instances/web/snapshots/snap0"]),
    ];
    expect(getDeviceVolumeInstanceCount(device, volumes, [])).toBe(1);
  });

  it("counts instances of the same name in other projects", () => {
    const volumes = [
      getVolume(["/1.0/instances/web", "/1.0/instances/web?project=other"]),
    ];
    expect(getDeviceVolumeInstanceCount(device, volumes, [])).toBe(2);
  });

  it("counts instances using the volume through a profile", () => {
    const volumes = [getVolume(["/1.0/profiles/with-data"])];
    const profiles = [
      getProfile("with-data", ["/1.0/instances/web", "/1.0/instances/db"]),
    ];
    expect(getDeviceVolumeInstanceCount(device, volumes, profiles)).toBe(2);
  });

  it("counts an instance using the volume directly and through a profile once", () => {
    const volumes = [
      getVolume(["/1.0/instances/web", "/1.0/profiles/with-data"]),
    ];
    const profiles = [
      getProfile("with-data", ["/1.0/instances/web", "/1.0/instances/db"]),
    ];
    expect(getDeviceVolumeInstanceCount(device, volumes, profiles)).toBe(2);
  });

  it("matches the profile by project", () => {
    const volumes = [getVolume(["/1.0/profiles/with-data?project=other"])];
    const profiles = [
      getProfile("with-data", ["/1.0/instances/web"]),
      getProfile(
        "with-data",
        ["/1.0/instances/a?project=other", "/1.0/instances/b?project=other"],
        "other",
      ),
    ];
    expect(getDeviceVolumeInstanceCount(device, volumes, profiles)).toBe(2);
  });

  it("returns 0 for an unused volume", () => {
    expect(getDeviceVolumeInstanceCount(device, [getVolume([])], [])).toBe(0);
  });

  it("returns null when the volume is not in the list", () => {
    const volumes = [getVolume(["/1.0/instances/web"], { name: "other-vol" })];
    expect(getDeviceVolumeInstanceCount(device, volumes, [])).toBeNull();
  });

  it("returns null when a profile using the volume is not in the list", () => {
    const volumes = [getVolume(["/1.0/profiles/with-data"])];
    expect(getDeviceVolumeInstanceCount(device, volumes, [])).toBeNull();
  });

  it("ignores volumes of another type or pool", () => {
    const volumes = [
      getVolume(["/1.0/instances/web"], { type: "container" }),
      getVolume(["/1.0/instances/db"], { pool: "other-pool" }),
      getVolume(["/1.0/instances/cache"]),
    ];
    expect(getDeviceVolumeInstanceCount(device, volumes, [])).toBe(1);
  });

  it("counts only the volume on the given member for a local pool", () => {
    const volumes = [
      getVolume(["/1.0/instances/db", "/1.0/instances/cache"], {
        location: "member1",
      }),
      getVolume(["/1.0/instances/web"], { location: "member2" }),
    ];
    expect(getDeviceVolumeInstanceCount(device, volumes, [], "member2")).toBe(
      1,
    );
  });

  it("counts the volumes on all members without a location", () => {
    const volumes = [
      getVolume(["/1.0/instances/db", "/1.0/instances/cache"], {
        location: "member1",
      }),
      getVolume(["/1.0/instances/web"], { location: "member2" }),
    ];
    expect(getDeviceVolumeInstanceCount(device, volumes, [])).toBe(3);
  });
});
