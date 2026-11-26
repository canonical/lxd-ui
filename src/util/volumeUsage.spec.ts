import {
  getDeviceVolumes,
  getVolumeInstances,
  getVolumeProfiles,
} from "./volumeUsage";
import type { LxdDiskDevice } from "types/device";
import type { LxdProfile } from "types/profile";
import type { LxdStorageVolume } from "types/storage";
import type { LxdUsedBy } from "util/usedBy";

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
    location: "",
    used_by: usedBy,
    ...overrides,
  }) as LxdStorageVolume;

const getProfile = (usedBy: string[]): LxdProfile =>
  ({ used_by: usedBy }) as unknown as LxdProfile;

const getNames = (items: LxdUsedBy[]): string[] =>
  items.map((item) => `${item.project}/${item.name}`);

describe("getDeviceVolumes", () => {
  it("ignores volumes of another type, pool or name", () => {
    const match = getVolume([]);
    const volumes = [
      getVolume([], { type: "container" }),
      getVolume([], { pool: "other-pool" }),
      getVolume([], { name: "other-vol" }),
      match,
    ];
    expect(getDeviceVolumes(device, volumes)).toEqual([match]);
  });

  it("uses only the volume on the given member for a local pool", () => {
    const member2 = getVolume([], { location: "member2" });
    const volumes = [getVolume([], { location: "member1" }), member2];
    expect(getDeviceVolumes(device, volumes, "member2")).toEqual([member2]);
  });

  it("ignores another member's volume when it is the only one", () => {
    const volumes = [getVolume([], { location: "member1" })];
    expect(getDeviceVolumes(device, volumes, "member2")).toEqual([]);
  });

  it("uses a volume on a remote pool for any member", () => {
    const volumes = [getVolume([], { location: "none" })];
    expect(getDeviceVolumes(device, volumes, "member2")).toEqual(volumes);
  });

  it("uses the volumes on all members without a location", () => {
    const volumes = [
      getVolume([], { location: "member1" }),
      getVolume([], { location: "member2" }),
    ];
    expect(getDeviceVolumes(device, volumes)).toEqual(volumes);
  });
});

describe("getVolumeProfiles", () => {
  it("returns the profiles of all volumes once, with their project", () => {
    const volumes = [
      getVolume(["/1.0/instances/web", "/1.0/profiles/with-data"], {
        location: "member1",
      }),
      getVolume(
        ["/1.0/profiles/with-data", "/1.0/profiles/with-data?project=other"],
        { location: "member2" },
      ),
    ];
    expect(getNames(getVolumeProfiles(volumes))).toEqual([
      "default/with-data",
      "other/with-data",
    ]);
  });
});

describe("getVolumeInstances", () => {
  it("returns instances using the volume directly, sorted", () => {
    const volumes = [getVolume(["/1.0/instances/web", "/1.0/instances/db"])];
    expect(getNames(getVolumeInstances(volumes, []))).toEqual([
      "default/db",
      "default/web",
    ]);
  });

  it("ignores instance snapshots", () => {
    const volumes = [
      getVolume(["/1.0/instances/web", "/1.0/instances/web/snapshots/snap0"]),
    ];
    expect(getNames(getVolumeInstances(volumes, []))).toEqual(["default/web"]);
  });

  it("keeps instances of the same name in other projects", () => {
    const volumes = [
      getVolume(["/1.0/instances/web", "/1.0/instances/web?project=other"]),
    ];
    expect(getNames(getVolumeInstances(volumes, []))).toEqual([
      "default/web",
      "other/web",
    ]);
  });

  it("returns an instance using the volume directly and through a profile once", () => {
    const volumes = [
      getVolume(["/1.0/instances/web", "/1.0/profiles/with-data"]),
    ];
    const profiles = [
      getProfile(["/1.0/instances/web", "/1.0/instances/db?project=other"]),
    ];
    expect(getNames(getVolumeInstances(volumes, profiles))).toEqual([
      "default/web",
      "other/db",
    ]);
  });

  it("returns an empty list for an unused volume", () => {
    expect(getVolumeInstances([getVolume([])], [])).toEqual([]);
  });
});
