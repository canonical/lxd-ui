import type { LxdStoragePool } from "types/storage";
import { getVolumesUsedByPool } from "util/storagePool";

const createStoragePool = (
  name: string,
  usedBy?: string[],
): LxdStoragePool => ({
  name,
  description: "",
  driver: "dir",
  used_by: usedBy,
});

describe("getVolumesUsedByPool", () => {
  it("returns an empty list when the pool has no users", () => {
    expect(getVolumesUsedByPool(createStoragePool("pool"))).toEqual([]);
  });

  it("returns direct volume references for the pool", () => {
    const pool = createStoragePool("pool", [
      "/1.0/storage-pools/pool/volumes/custom/volume-1",
      "/1.0/storage-pools/other/volumes/custom/volume-2",
      "/1.0/storage-pools/pool/volumes/virtual-machine/volume-3",
    ]);

    expect(getVolumesUsedByPool(pool)).toEqual([
      "/1.0/storage-pools/pool/volumes/custom/volume-1",
      "/1.0/storage-pools/pool/volumes/virtual-machine/volume-3",
    ]);
  });

  it("excludes snapshot references", () => {
    const pool = createStoragePool("pool", [
      "/1.0/storage-pools/pool/volumes/custom/volume-1",
      "/1.0/storage-pools/pool/volumes/custom/volume-1/snapshots/snapshot-1",
    ]);

    expect(getVolumesUsedByPool(pool)).toEqual([
      "/1.0/storage-pools/pool/volumes/custom/volume-1",
    ]);
  });

  it("matches pool names using their encoded path", () => {
    const pool = createStoragePool("pool name", [
      "/1.0/storage-pools/pool%20name/volumes/custom/volume-1",
      "/1.0/storage-pools/pool name/volumes/custom/volume-2",
    ]);

    expect(getVolumesUsedByPool(pool)).toEqual([
      "/1.0/storage-pools/pool%20name/volumes/custom/volume-1",
    ]);
  });
});
