import { filterUsedByType } from "./usedBy";

describe("filterUsedByType", () => {
  it("finds standard instance", () => {
    const paths = ["/1.0/instances/pet-lark"];
    const results = filterUsedByType("instances", paths);

    expect(results[0].name).toBe("pet-lark");
    expect(results[0].project).toBe("default");
  });

  it("finds snapshot with custom project", () => {
    const paths = ["/1.0/instances/relaxed-basilisk/snapshots/ff?project=foo"];
    const results = filterUsedByType("snapshots", paths);

    expect(results[0].instance).toBe("relaxed-basilisk");
    expect(results[0].name).toBe("ff");
    expect(results[0].project).toBe("foo");
  });

  it("finds profile with custom project", () => {
    const paths = ["/1.0/profiles/my_profile?project=foo"];
    const results = filterUsedByType("profiles", paths);

    expect(results[0].name).toBe("my_profile");
    expect(results[0].project).toBe("foo");
  });

  it("decodes url encoded volume names", () => {
    const paths = [
      "/1.0/storage-pools/dir/volumes/custom/t%25C3%25BCdeld%25C3%25BC",
    ];
    const results = filterUsedByType("volumes", paths);

    expect(results[0].name).toBe("tüdeldü");
    expect(results[0].project).toBe("default");
  });
});
