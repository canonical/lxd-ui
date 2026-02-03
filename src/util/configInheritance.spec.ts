import {
  getConfigRowMetadata,
  getInheritedNetworks,
} from "util/configInheritance";
import type { StoragePoolFormValues } from "types/forms/storagePool";
import type { StorageVolumeFormValues } from "types/forms/storageVolume";
import type { InstanceAndProfileFormValues } from "types/forms/instanceAndProfile";
import type { LxdProfile } from "types/profile";

beforeEach(() => {
  vi.mock("@tanstack/react-query", () => ({
    useQuery: vi.fn().mockReturnValue({
      data: {
        configs: {
          "storage-ceph": {
            "pool-conf": {
              keys: [
                {
                  "ceph.cluster_name": {
                    defaultdesc: "`ceph`",
                    longdesc: "",
                    shortdesc:
                      "Name of the Ceph cluster in which to create new storage pools",
                    type: "string",
                  },
                },
              ],
            },
          },
          "storage-zfs": {
            "volume-conf": {
              keys: [
                {
                  "block.filesystem": {
                    condition:
                      "block-based volume with content type `filesystem`",
                    defaultdesc: "same as `volume.block.filesystem`",
                    longdesc:
                      "Valid options are: `btrfs`, `ext4`, `xfs`\nIf not set, `ext4` is assumed.",
                    shortdesc: "File system of the storage volume",
                    type: "string",
                  },
                },
              ],
            },
          },
        },
      },
    }),
  }));
  // this mock is required for getStorageVolumeRowMetadata since we call useStoragePool that invokes useContext from react
  vi.mock(import("react"), async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useContext: vi.fn().mockReturnValue({
        isFineGrained: true,
      }),
    };
  });
});

describe("getConfigRowMetadata", () => {
  it("responds with row metadata for a storage pool", () => {
    const poolValues = {
      driver: "ceph",
      entityType: "storagePool",
    } as StoragePoolFormValues;

    const result = getConfigRowMetadata(poolValues, "ceph_cluster_name");

    expect(result.configField?.shortdesc).toBe(
      "Name of the Ceph cluster in which to create new storage pools",
    );
    expect(result.configField?.default).toBe("ceph");
  });

  it("responds with row metadata for a storage volume", () => {
    const volumeValues = {
      entityType: "storageVolume",
    } as StorageVolumeFormValues;

    const result = getConfigRowMetadata(volumeValues, "block_filesystem");

    expect(result.configField?.shortdesc).toBe(
      "File system of the storage volume",
    );
    expect(result.configField?.longdesc).toBe(
      "Valid options are: `btrfs`, `ext4`, `xfs`\n" +
        "If not set, `ext4` is assumed.",
    );
  });

  it("devices with same name in inherited profiles override each other", () => {
    const values = {
      entityType: "instance",
      profiles: ["foo", "bar"],
    } as InstanceAndProfileFormValues;
    const profiles = [
      {
        name: "foo",
        description: "",
        config: {},
        devices: {
          abc: {
            network: "foo profile network",
            type: "nic",
          },
        },
      },
      {
        name: "bar",
        description: "",
        config: {},
        devices: {
          abc: {
            network: "bar profile network",
            type: "nic",
          },
        },
      },
    ] as LxdProfile[];

    const result = getInheritedNetworks(values, profiles);

    expect(result.length).toBe(1);
    expect(result[0].source).toBe("bar profile");
  });
});
