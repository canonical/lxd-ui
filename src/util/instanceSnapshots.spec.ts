import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import type { LxdDevices, LxdDiskDevice } from "types/device";
import type { LxdStorageVolume, LxdVolumeSnapshot } from "types/storage";
import {
  getCustomVolumeDeviceLabel,
  getCustomVolumeDevices,
  getCustomVolumeDevicesToSnapshot,
  getCustomVolumeSnapshotDevices,
  getCustomVolumeSnapshotLinks,
  getInstanceSnapshotsByVolumeSnapshotUuid,
  getSnapshotCustomVolumes,
  hasUnreadableCustomVolumeSnapshotDevices,
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

  it("skips ISO volumes", () => {
    const instance = getInstance({
      root: rootDisk,
      "iso-volume": { type: "disk", pool: "default", source: "ubuntu-iso" },
      "iso-volume-profile": {
        type: "disk",
        pool: "default",
        source: "debian-iso",
      },
    });
    expect(getCustomVolumeDevices(instance)).toEqual([]);
  });
});

describe("getCustomVolumeDeviceLabel", () => {
  it("returns the mount path of a filesystem volume", () => {
    const instance = getInstance({ root: rootDisk, data: dataDisk });
    expect(getCustomVolumeDeviceLabel(instance, "data")).toBe("/data");
  });

  it("returns the device name of a block volume or a detached device", () => {
    const instance = getInstance({
      root: rootDisk,
      block: { type: "disk", pool: "default", source: "block-vol" },
    });
    expect(getCustomVolumeDeviceLabel(instance, "block")).toBe("block");
    expect(getCustomVolumeDeviceLabel(instance, "gone")).toBe("gone");
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

  it("picks the volume on the instance's member for a local pool", () => {
    const instance = {
      ...getInstance({ root: rootDisk, data: dataDisk }),
      location: "member2",
    } as LxdInstance;
    const volumes = [
      {
        ...getVolume("data-vol", ["/1.0/instances/db"]),
        location: "member1",
      },
      {
        ...getVolume("data-vol", ["/1.0/instances/web"]),
        location: "member2",
      },
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
    expect(getCustomVolumeSnapshotDevices(getSnapshot('["data"]'))).toEqual([]);
  });
});

describe("hasUnreadableCustomVolumeSnapshotDevices", () => {
  it("is false for a missing or valid record", () => {
    expect(hasUnreadableCustomVolumeSnapshotDevices(getSnapshot())).toBe(false);
    expect(hasUnreadableCustomVolumeSnapshotDevices(getSnapshot("{}"))).toBe(
      false,
    );
  });

  it("is true for a record that is not a JSON object", () => {
    expect(
      hasUnreadableCustomVolumeSnapshotDevices(getSnapshot("not json")),
    ).toBe(true);
    expect(hasUnreadableCustomVolumeSnapshotDevices(getSnapshot("null"))).toBe(
      true,
    );
    expect(
      hasUnreadableCustomVolumeSnapshotDevices(getSnapshot('["data"]')),
    ).toBe(true);
  });

  it("is true for a record with a value that is not a UUID string", () => {
    expect(
      hasUnreadableCustomVolumeSnapshotDevices(getSnapshot('{"data":1}')),
    ).toBe(true);
  });
});

const dataUuid = "eb2d384b-c790-4261-9e82-7b017cd26009";
const walUuid = "6a8c757f-4d12-43b4-94a1-3ea735e1faf7";

const getLinkedSnapshot = (
  name: string,
  attachedVolumes: Record<string, string>,
  devices: LxdDevices,
): LxdInstanceSnapshot =>
  ({
    name,
    config: { "volatile.attached_volumes": JSON.stringify(attachedVolumes) },
    expanded_devices: devices,
  }) as unknown as LxdInstanceSnapshot;

const getVolumeSnapshot = (name: string, uuid: string): LxdVolumeSnapshot =>
  ({ name, config: { "volatile.uuid": uuid } }) as LxdVolumeSnapshot;

describe("getSnapshotCustomVolumes", () => {
  it("returns the volumes of the devices recorded in the snapshots once", () => {
    const instance = {
      ...getInstance({ root: rootDisk }),
      snapshots: [
        getLinkedSnapshot("snap0", { data: dataUuid }, { data: dataDisk }),
        getLinkedSnapshot("snap1", { data: walUuid }, { data: dataDisk }),
      ],
    } as LxdInstance;
    const volume = getVolume("data-vol", []);
    expect(getSnapshotCustomVolumes(instance, [volume])).toEqual([volume]);
  });

  it("picks the volume on the instance's member for a local pool", () => {
    const instance = {
      ...getInstance({ root: rootDisk }),
      location: "member2",
      snapshots: [
        getLinkedSnapshot("snap0", { data: dataUuid }, { data: dataDisk }),
      ],
    } as LxdInstance;
    const volume = { ...getVolume("data-vol", []), location: "member2" };
    const volumes = [
      { ...getVolume("data-vol", []), location: "member1" },
      volume,
    ];
    expect(getSnapshotCustomVolumes(instance, volumes)).toEqual([volume]);
  });

  it("skips devices without a matching custom volume", () => {
    const instance = {
      ...getInstance({ root: rootDisk }),
      snapshots: [
        getLinkedSnapshot("snap0", { data: dataUuid }, { data: dataDisk }),
        getLinkedSnapshot("snap1", { gone: walUuid }, {}),
      ],
    } as LxdInstance;
    expect(getSnapshotCustomVolumes(instance, [])).toEqual([]);
  });
});

describe("getCustomVolumeSnapshotLinks", () => {
  const dataVolume = getVolume("data-vol", []);
  const walVolume = getVolume("wal-vol", []);
  const snapshot = getLinkedSnapshot(
    "snap0",
    { wal: walUuid, data: dataUuid },
    { data: dataDisk },
  );

  it("links each device to the volume snapshot with its UUID, sorted by device", () => {
    const dataSnapshot = getVolumeSnapshot("snap3", dataUuid);
    const walSnapshot = getVolumeSnapshot("snap1", walUuid);
    expect(
      getCustomVolumeSnapshotLinks(snapshot, [
        { volume: walVolume, snapshots: [walSnapshot] },
        { volume: dataVolume, snapshots: [dataSnapshot] },
      ]),
    ).toEqual([
      { deviceLabel: "/data", volume: dataVolume, snapshot: dataSnapshot },
      { deviceLabel: "wal", volume: walVolume, snapshot: walSnapshot },
    ]);
  });

  it("skips devices whose volume snapshot is not found", () => {
    const dataSnapshot = getVolumeSnapshot("snap3", dataUuid);
    expect(
      getCustomVolumeSnapshotLinks(snapshot, [
        { volume: dataVolume, snapshots: [dataSnapshot] },
      ]),
    ).toEqual([
      { deviceLabel: "/data", volume: dataVolume, snapshot: dataSnapshot },
    ]);
  });
});

describe("getInstanceSnapshotsByVolumeSnapshotUuid", () => {
  it("maps each recorded volume snapshot UUID to its instance snapshot", () => {
    const nightly = getLinkedSnapshot(
      "nightly",
      { data: dataUuid, wal: walUuid },
      {},
    );
    const web = { ...getInstance({}), snapshots: [getSnapshot(), nightly] };
    const db = { ...getInstance({}), name: "db", snapshots: null };
    const result = getInstanceSnapshotsByVolumeSnapshotUuid([
      db,
      web,
    ] as LxdInstance[]);
    expect([...result.keys()]).toEqual([dataUuid, walUuid]);
    expect(result.get(walUuid)).toEqual({ instance: web, snapshot: nightly });
  });

  it("skips unreadable records", () => {
    const web = {
      ...getInstance({}),
      snapshots: [getSnapshot("not json")],
    } as LxdInstance;
    expect(getInstanceSnapshotsByVolumeSnapshotUuid([web]).size).toBe(0);
  });
});
