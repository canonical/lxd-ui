import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import type { LxdDevices, LxdDiskDevice } from "types/device";
import type { LxdStorageVolume } from "types/storage";
import {
  getCustomVolumeDevices,
  getCustomVolumeDevicesToSnapshot,
  getCustomVolumeSnapshotDevices,
} from "./instanceSnapshots";

const rootDisk: LxdDiskDevice = { type: "disk", path: "/", pool: "default" };
const dataDisk: LxdDiskDevice = {
  type: "disk",
  path: "/data",
  pool: "default",
  source: "data-vol",
};

const getInstance = (devices: LxdDevices): LxdInstance =>
  ({
    name: "web",
    project: "default",
    expanded_devices: devices,
  }) as unknown as LxdInstance;

const getVolume = (name: string, usedBy: string[]): LxdStorageVolume =>
  ({ name, pool: "default", used_by: usedBy }) as unknown as LxdStorageVolume;

const getSnapshot = (attachedVolumes?: string): LxdInstanceSnapshot =>
  ({
    config:
      attachedVolumes === undefined
        ? {}
        : { "volatile.attached_volumes": attachedVolumes },
  }) as unknown as LxdInstanceSnapshot;

describe("getCustomVolumeDevices", () => {
  it("returns attached custom volume devices sorted, without root disk or host paths", () => {
    const instance = getInstance({
      root: rootDisk,
      wal: { ...dataDisk, source: "wal-vol" },
      data: dataDisk,
      share: { type: "disk", path: "/mnt", source: "/home" },
    });
    expect(getCustomVolumeDevices(instance)).toEqual(["data", "wal"]);
  });
});

describe("getCustomVolumeDevicesToSnapshot", () => {
  it("returns an attached volume used only by this instance", () => {
    const instance = getInstance({ root: rootDisk, data: dataDisk });
    const volumes = [getVolume("data-vol", ["/1.0/instances/web"])];
    expect(getCustomVolumeDevicesToSnapshot(instance, volumes)).toEqual([
      "data",
    ]);
  });

  it("returns a custom block volume, which has no path", () => {
    const instance = getInstance({
      root: rootDisk,
      block: { type: "disk", pool: "default", source: "block-vol" },
    });
    const volumes = [getVolume("block-vol", ["/1.0/instances/web"])];
    expect(getCustomVolumeDevicesToSnapshot(instance, volumes)).toEqual([
      "block",
    ]);
  });

  it("ignores the instance's own snapshots and profiles in used_by", () => {
    const instance = getInstance({ root: rootDisk, data: dataDisk });
    const volumes = [
      getVolume("data-vol", [
        "/1.0/instances/web",
        "/1.0/instances/web/snapshots/snap0",
        "/1.0/profiles/with-data",
      ]),
    ];
    expect(getCustomVolumeDevicesToSnapshot(instance, volumes)).toEqual([
      "data",
    ]);
  });

  it("skips a volume shared with another instance", () => {
    const instance = getInstance({ root: rootDisk, data: dataDisk });
    const volumes = [
      getVolume("data-vol", ["/1.0/instances/web", "/1.0/instances/db"]),
    ];
    expect(getCustomVolumeDevicesToSnapshot(instance, volumes)).toEqual([]);
  });

  it("skips a volume used by an instance of the same name in another project", () => {
    const instance = getInstance({ root: rootDisk, data: dataDisk });
    const volumes = [
      getVolume("data-vol", [
        "/1.0/instances/web",
        "/1.0/instances/web?project=other",
      ]),
    ];
    expect(getCustomVolumeDevicesToSnapshot(instance, volumes)).toEqual([]);
  });

  it("skips devices without a matching custom volume, such as ISO volumes", () => {
    const instance = getInstance({
      root: rootDisk,
      "iso-volume": { type: "disk", pool: "default", source: "ubuntu-iso" },
    });
    expect(getCustomVolumeDevicesToSnapshot(instance, [])).toEqual([]);
  });

  it("skips host paths and the root disk", () => {
    const instance = getInstance({
      root: rootDisk,
      share: { type: "disk", path: "/mnt", source: "/home" },
    });
    expect(getCustomVolumeDevicesToSnapshot(instance, [])).toEqual([]);
  });

  it("returns device names sorted", () => {
    const instance = getInstance({
      root: rootDisk,
      wal: { ...dataDisk, source: "wal-vol" },
      data: dataDisk,
    });
    const volumes = [
      getVolume("data-vol", ["/1.0/instances/web"]),
      getVolume("wal-vol", ["/1.0/instances/web"]),
    ];
    expect(getCustomVolumeDevicesToSnapshot(instance, volumes)).toEqual([
      "data",
      "wal",
    ]);
  });
});

describe("getCustomVolumeSnapshotDevices", () => {
  it("returns the recorded device names sorted", () => {
    const snapshot = getSnapshot(
      '{"wal":"6a8c757f-4d12-43b4-94a1-3ea735e1faf7","data":"eb2d384b-c790-4261-9e82-7b017cd26009"}',
    );
    expect(getCustomVolumeSnapshotDevices(snapshot)).toEqual(["data", "wal"]);
  });

  it("returns nothing without a record", () => {
    expect(getCustomVolumeSnapshotDevices(getSnapshot())).toEqual([]);
    expect(getCustomVolumeSnapshotDevices(getSnapshot(""))).toEqual([]);
  });

  it("returns nothing for an empty record", () => {
    expect(getCustomVolumeSnapshotDevices(getSnapshot("{}"))).toEqual([]);
  });

  it("returns nothing for a record that is not a JSON object", () => {
    expect(getCustomVolumeSnapshotDevices(getSnapshot("not json"))).toEqual([]);
    expect(getCustomVolumeSnapshotDevices(getSnapshot("null"))).toEqual([]);
    expect(getCustomVolumeSnapshotDevices(getSnapshot('"data"'))).toEqual([]);
  });
});
