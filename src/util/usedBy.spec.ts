import { filterUsedByType, getLinkTarget } from "./usedBy";

describe("filterUsedByType", () => {
  it("finds standard instance", () => {
    const paths = ["/1.0/instances/pet-lark"];
    const results = filterUsedByType("instance", paths);

    expect(results[0].name).toBe("pet-lark");
    expect(results[0].project).toBe("default");
  });

  it("finds snapshot with custom project", () => {
    const paths = ["/1.0/instances/relaxed-basilisk/snapshots/ff?project=foo"];
    const results = filterUsedByType("snapshot", paths);

    expect(results[0].instance).toBe("relaxed-basilisk");
    expect(results[0].name).toBe("ff");
    expect(results[0].project).toBe("foo");
  });

  it("finds profile with custom project", () => {
    const paths = ["/1.0/profiles/my_profile?project=foo"];
    const results = filterUsedByType("profile", paths);

    expect(results[0].name).toBe("my_profile");
    expect(results[0].project).toBe("foo");
    expect(results[0].instance).toBe(undefined);
  });

  it("decodes url encoded volume names", () => {
    const paths = ["/1.0/storage-pools/dir/volumes/custom/t%C3%BCdeld%C3%BC"];
    const results = filterUsedByType("volume", paths);

    expect(results[0].name).toBe("tüdeldü");
    expect(results[0].project).toBe("default");
    expect(results[0].instance).toBe(undefined);
  });

  it("decodes volume names containing a percent sign only once", () => {
    const paths = [
      "/1.0/storage-pools/dir/volumes/custom/50%25off",
      "/1.0/storage-pools/dir/volumes/custom/100%2525",
    ];
    const results = filterUsedByType("volume", paths);

    expect(results.map((item) => item.name)).toEqual(["100%25", "50%off"]);
  });

  it("decodes the volume name of a volume snapshot", () => {
    const paths = [
      "/1.0/storage-pools/dir/volumes/custom/my%20volume/snapshots/snap%250",
    ];
    const results = filterUsedByType("snapshot", paths);

    expect(results[0].name).toBe("snap%0");
    expect(results[0].pool).toBe("dir");
    expect(results[0].volume).toBe("my volume");
  });

  it("finds instance snapshot", () => {
    const paths = [
      "/1.0/instances/absolute-jennet/snapshots/snap0?project=Animals",
    ];
    const results = filterUsedByType("snapshot", paths);

    expect(results[0].name).toBe("snap0");
    expect(results[0].project).toBe("Animals");
    expect(results[0].instance).toBe("absolute-jennet");
    expect(results[0].volume).toBe(undefined);
  });

  it("finds volume snapshot", () => {
    const paths = [
      "/1.0/storage-pools/poolName/volumes/custom/volumeName/snapshots/snap1?project=fooProject",
    ];
    const results = filterUsedByType("snapshot", paths);

    expect(results[0].name).toBe("snap1");
    expect(results[0].project).toBe("fooProject");
    expect(results[0].instance).toBe(undefined);
    expect(results[0].volume).toBe("volumeName");
    expect(results[0].pool).toBe("poolName");
  });

  it("finds volume target", () => {
    const paths = [
      "/1.0/storage-pools/local/volumes/custom/abb?project=robots&target=micro2",
    ];
    const results = filterUsedByType("volume", paths);

    expect(results[0].name).toBe("abb");
    expect(results[0].project).toBe("robots");
    expect(results[0].instance).toBe(undefined);
    expect(results[0].volume).toBe(undefined);
    expect(results[0].target).toBe("micro2");
  });

  it("finds volume snapshot target", () => {
    const paths = [
      "/1.0/storage-pools/dirydir/volumes/custom/abb/snapshots/snap03?target=micro2",
    ];
    const results = filterUsedByType("snapshot", paths);

    expect(results[0].name).toBe("snap03");
    expect(results[0].project).toBe("default");
    expect(results[0].pool).toBe("dirydir");
    expect(results[0].instance).toBe(undefined);
    expect(results[0].volume).toBe("abb");
    expect(results[0].target).toBe("micro2");
  });

  it("finds image registry", () => {
    const paths = ["/1.0/image-registries/registry1?project=foo"];
    const results = filterUsedByType("image-registry", paths);

    expect(results[0].name).toBe("registry1");
    expect(results[0].project).toBe("foo");
  });

  it("keeps network acls out of networks", () => {
    const paths = ["/1.0/networks/br0", "/1.0/network-acls/acl1?project=foo"];
    const results = filterUsedByType("network", paths);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("br0");
  });

  it("finds network acl", () => {
    const paths = [
      "/1.0/networks/br0",
      "/1.0/network-acls/acl1?project=foo",
      "/1.0/network-acls/acl2",
    ];
    const results = filterUsedByType("network-acl", paths);

    expect(results.map((item) => item.name)).toEqual(["acl2", "acl1"]);
    expect(results[1].project).toBe("foo");
    expect(getLinkTarget(results[1], "network-acl")).toBe(
      "/ui/project/foo/network-acl/acl1",
    );
  });

  it("keeps image registries out of images", () => {
    const paths = [
      "/1.0/images/b5509ae406f4?project=foo",
      "/1.0/image-registries/registry1?project=foo",
    ];

    expect(filterUsedByType("image", paths)).toHaveLength(1);
    expect(filterUsedByType("image-registry", paths)).toHaveLength(1);
  });

  describe("project used by", () => {
    const paths = [
      "/1.0/instances/web?project=foo",
      "/1.0/networks/br0?project=foo",
      "/1.0/network-acls/acl1?project=foo",
      "/1.0/storage-pools/local/buckets/b1?project=foo&target=micro1",
      "/1.0/placement-groups/spread?project=foo",
      "/1.0/replicators/rep1?project=foo",
    ];

    it.each([
      ["network", "br0", "/ui/project/foo/network/br0"],
      ["network-acl", "acl1", "/ui/project/foo/network-acl/acl1"],
      ["bucket", "b1", "/ui/project/foo/storage/pool/local/bucket/b1"],
      ["placement-group", "spread", "/ui/project/foo/placement-groups"],
      ["replicator", "rep1", "/ui/project/foo/replicator/rep1"],
    ] as const)("finds %s and links it", (type, name, link) => {
      const results = filterUsedByType(type, paths);

      expect(results.map((item) => item.name)).toEqual([name]);
      expect(results[0].project).toBe("foo");
      expect(getLinkTarget(results[0], type)).toBe(link);
    });

    it("keeps the bucket pool and target", () => {
      const [bucket] = filterUsedByType("bucket", paths);

      expect(bucket.pool).toBe("local");
      expect(bucket.target).toBe("micro1");
    });
  });
});
