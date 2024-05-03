import { extractResourceDetailsFromUrl } from "./resourceDetails";

describe("extractResourceDetailsFromUrl", () => {
  it("extracts resource details from server url", () => {
    const path = "/1.0";
    const resourceDetail = extractResourceDetailsFromUrl("server", path);
    expect(resourceDetail).toEqual({
      name: "server",
      path: path,
      type: "server",
    });
  });

  it("extracts resource details from instance url", () => {
    const path = "/1.0/instances/instance-1?project=default";
    const resourceDetail = extractResourceDetailsFromUrl("instance", path);
    expect(resourceDetail).toEqual({
      name: "instance-1",
      path: path,
      type: "instance",
      project: "default",
    });
  });

  it("extracts resource details from storage volume url", () => {
    const path =
      "/1.0/storage-pools/default/volumes/virtual-machine/volume-test?project=default&target=node-1";
    const resourceDetail = extractResourceDetailsFromUrl(
      "storage_volume",
      path,
    );
    expect(resourceDetail).toEqual({
      name: "volume-test",
      path: path,
      type: "storage_volume",
      project: "default",
      target: "node-1",
      pool: "default",
    });
  });

  it("extracts resource details from instance snapshot url", () => {
    const path = "/1.0/instances/instance-1/snapshots/snap0";
    const resourceDetail = extractResourceDetailsFromUrl("snapshot", path);
    expect(resourceDetail).toEqual({
      name: "snap0",
      path: path,
      type: "snapshot",
      instance: "instance-1",
    });
  });

  it("extracts resource details from instance snapshot url", () => {
    const path =
      "/1.0/storage-pools/default/volumes/custom/volume-test/snapshots/snap0";
    const resourceDetail = extractResourceDetailsFromUrl("snapshot", path);
    expect(resourceDetail).toEqual({
      name: "snap0",
      path: path,
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
