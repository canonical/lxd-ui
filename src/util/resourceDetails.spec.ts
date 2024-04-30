import { extractResourceDetailsFromUrl } from "./resourceDetails";

describe("extractResourceDetailsFromUrl", () => {
  it("extracts resource details from lxd entity urls", () => {
    const serverPath = "/1.0";
    const instancePath = "/1.0/instances/instance-1?project=default";
    const storageVolumePath =
      "/1.0/storage-pools/default/volumes/virtual-machine/volume-test?project=default&target=node-1";
    const instanceSnapshotPath = "/1.0/instances/instance-1/snapshots/snap0";
    const volumeSnapshotPath =
      "/1.0/storage-pools/default/volumes/custom/volume-test/snapshots/snap0";

    const serverDetail = extractResourceDetailsFromUrl("server", serverPath);
    expect(serverDetail).toEqual({
      name: "server",
      path: serverPath,
      type: "server",
    });

    const instanceDetail = extractResourceDetailsFromUrl(
      "instance",
      instancePath,
    );
    expect(instanceDetail).toEqual({
      name: "instance-1",
      path: instancePath,
      type: "instance",
      project: "default",
    });

    const storageVolumeDetail = extractResourceDetailsFromUrl(
      "storage_volume",
      storageVolumePath,
    );
    expect(storageVolumeDetail).toEqual({
      name: "volume-test",
      path: storageVolumePath,
      type: "storage_volume",
      project: "default",
      target: "node-1",
      pool: "default",
    });

    const instanceSnapshotDetail = extractResourceDetailsFromUrl(
      "snapshot",
      instanceSnapshotPath,
    );
    expect(instanceSnapshotDetail).toEqual({
      name: "snap0",
      path: instanceSnapshotPath,
      type: "snapshot",
      instance: "instance-1",
    });

    const volumeSnapshotDetail = extractResourceDetailsFromUrl(
      "snapshot",
      volumeSnapshotPath,
    );
    expect(volumeSnapshotDetail).toEqual({
      name: "snap0",
      path: volumeSnapshotPath,
      type: "snapshot",
      pool: "default",
      volume: "volume-test",
    });
  });

  it("extracts human readable details for images and identities if name lookup is provided", () => {
    const imagePath = "/1.0/images/image-id?project=default";
    const identityPath = "/1.0/auth/identities/tls/identity-id";
    const imagesNameLookup = {
      "image-id": "image-name",
    };
    const identityNamesLookup = {
      "identity-id": "identity-name",
    };

    const imageDetail = extractResourceDetailsFromUrl(
      "image",
      imagePath,
      imagesNameLookup,
      identityNamesLookup,
    );
    expect(imageDetail).toEqual({
      name: "image-name",
      path: imagePath,
      type: "image",
      project: "default",
    });

    const identityDetail = extractResourceDetailsFromUrl(
      "identity",
      identityPath,
      imagesNameLookup,
      identityNamesLookup,
    );
    expect(identityDetail).toEqual({
      name: "identity-name",
      path: identityPath,
      type: "identity",
    });
  });
});
