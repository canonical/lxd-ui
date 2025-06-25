import { filterUsedByType } from "./usedBy";

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
    const paths = [
      "/1.0/storage-pools/dir/volumes/custom/t%25C3%25BCdeld%25C3%25BC",
    ];
    const results = filterUsedByType("volume", paths);

    expect(results[0].name).toBe("tüdeldü");
    expect(results[0].project).toBe("default");
    expect(results[0].instance).toBe(undefined);
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
});
