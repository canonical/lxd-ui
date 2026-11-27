import { getLastSuccessStartedAt, isCephMirrored } from "./replicator";
import type { LxdInstance } from "types/instance";
import type { LxdReplicator, LxdReplicatorStatus } from "types/replicator";
import type { LxdStoragePool } from "types/storage";

const pool = (name: string, config: Record<string, string>): LxdStoragePool =>
  ({ name, driver: "ceph", config }) as unknown as LxdStoragePool;

const localPool = (name: string): LxdStoragePool =>
  ({ name, driver: "zfs", config: {} }) as unknown as LxdStoragePool;

const instance = (rootPool: string, volumes: string[] = []): LxdInstance =>
  ({
    expanded_devices: {
      root: { type: "disk", path: "/", pool: rootPool },
      ...Object.fromEntries(
        volumes.map((volume) => {
          const [pool, source] = volume.split("/");
          return [source, { type: "disk", path: `/${source}`, pool, source }];
        }),
      ),
    },
  }) as unknown as LxdInstance;

const mirrored = { "ceph.replicator.rep-demo": "site-b" };

describe("isCephMirrored", () => {
  it("is true when every pool used by the instances mirrors the project", () => {
    const pools = [pool("ceph1", mirrored), pool("ceph2", mirrored)];
    const instances = [instance("ceph1"), instance("ceph1", ["ceph2/data"])];
    expect(isCephMirrored(pools, instances, "rep-demo")).toBe(true);
  });

  it("is false when one pool used by the instances is not mirrored", () => {
    const pools = [pool("ceph1", mirrored), pool("ceph2", {})];
    const instances = [instance("ceph1"), instance("ceph2")];
    expect(isCephMirrored(pools, instances, "rep-demo")).toBe(false);
  });

  it("is false when a volume attached to one instance is not mirrored", () => {
    const pools = [pool("ceph1", mirrored), pool("ceph2", {})];
    const instances = [instance("ceph1", ["ceph2/data"])];
    expect(isCephMirrored(pools, instances, "rep-demo")).toBe(false);
  });

  it("ignores volumes shared by several instances", () => {
    const pools = [pool("ceph1", mirrored), pool("ceph2", {})];
    const instances = [
      { ...instance("ceph1", ["ceph2/shared"]), location: "member1" },
      { ...instance("ceph1", ["ceph2/shared"]), location: "member2" },
    ] as LxdInstance[];
    expect(isCephMirrored(pools, instances, "rep-demo")).toBe(true);
  });

  it("ignores ISO volumes", () => {
    const pools = [pool("ceph1", mirrored), pool("ceph2", {})];
    const iso = instance("ceph1");
    iso.expanded_devices = {
      ...iso.expanded_devices,
      "iso-volume": { type: "disk", pool: "ceph2", source: "ubuntu.iso" },
    };
    expect(isCephMirrored(pools, [iso], "rep-demo")).toBe(true);
  });

  it("counts local volumes with the same name on different members", () => {
    const pools = [pool("ceph1", mirrored), localPool("zfs1")];
    const instances = [
      { ...instance("ceph1", ["zfs1/data"]), location: "member1" },
      { ...instance("ceph1", ["zfs1/data"]), location: "member2" },
    ] as LxdInstance[];
    expect(isCephMirrored(pools, instances, "rep-demo")).toBe(false);
  });

  it("is unknown when a used pool is not visible", () => {
    const pools = [pool("ceph1", mirrored)];
    const instances = [instance("ceph1"), instance("hidden")];
    expect(isCephMirrored(pools, instances, "rep-demo")).toBeUndefined();
  });

  it("ignores pools that no instance uses", () => {
    const pools = [pool("ceph1", mirrored), pool("ceph2", {})];
    expect(isCephMirrored(pools, [instance("ceph1")], "rep-demo")).toBe(true);
  });

  it("is true without instances when a pool mirrors the project", () => {
    const pools = [pool("ceph2", {}), pool("ceph1", mirrored)];
    expect(isCephMirrored(pools, [], "rep-demo")).toBe(true);
  });

  it("is false when only another project is mirrored", () => {
    const pools = [pool("ceph1", { "ceph.replicator.other": "site-b" })];
    expect(isCephMirrored(pools, [instance("ceph1")], "rep-demo")).toBe(false);
  });

  it("is false when the peer site is empty", () => {
    const pools = [pool("ceph1", { "ceph.replicator.rep-demo": " " })];
    expect(isCephMirrored(pools, [instance("ceph1")], "rep-demo")).toBe(false);
  });

  it("is false without pools", () => {
    expect(isCephMirrored([], [], "rep-demo")).toBe(false);
  });
});

describe("getLastSuccessStartedAt", () => {
  const replicator = (last_run_status: LxdReplicatorStatus) =>
    ({
      last_run_at: "2026-09-04T13:04:00Z",
      last_run_status,
    }) as LxdReplicator;

  it("is the latest run start when the latest run completed", () => {
    expect(getLastSuccessStartedAt(replicator("Completed"))).toBe(
      "2026-09-04T13:04:00Z",
    );
  });

  it.each<LxdReplicatorStatus>(["Running", "Failed", "Pending"])(
    "is unknown when the latest run is %s",
    (status) => {
      expect(getLastSuccessStartedAt(replicator(status))).toBeUndefined();
    },
  );
});
