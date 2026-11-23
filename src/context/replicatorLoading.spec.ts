import { parseReplicatorKeyFromUrl } from "./replicatorLoading";

describe("parseReplicatorKeyFromUrl", () => {
  it("builds the key from the replicator name and project", () => {
    expect(
      parseReplicatorKeyFromUrl("/1.0/replicators/rep1?project=normal"),
    ).toBe("normal/rep1");
  });

  it("falls back to the default project", () => {
    expect(parseReplicatorKeyFromUrl("/1.0/replicators/rep1")).toBe(
      "default/rep1",
    );
    expect(parseReplicatorKeyFromUrl("/1.0/replicators/rep1?project=")).toBe(
      "default/rep1",
    );
  });

  it("decodes project names containing a percent sign only once", () => {
    const urls = [
      "/1.0/replicators/rep1?project=a%25b",
      "/1.0/replicators/rep1?project=100%25",
      "/1.0/replicators/rep1?project=a%2541",
      "/1.0/replicators/rep1?project=a%252541",
      "/1.0/replicators/rep1?project=a%2Bb",
      "/1.0/replicators/rep1?project=t%C3%BCdeld%C3%BC",
    ];

    expect(urls.map(parseReplicatorKeyFromUrl)).toEqual([
      "a%b/rep1",
      "100%/rep1",
      "a%41/rep1",
      "a%2541/rep1",
      "a+b/rep1",
      "tüdeldü/rep1",
    ]);
  });

  it("decodes replicator names containing a percent sign only once", () => {
    expect(
      parseReplicatorKeyFromUrl("/1.0/replicators/50%25off?project=a%25b"),
    ).toBe("a%b/50%off");
  });

  it("returns null for urls without a replicator name", () => {
    expect(parseReplicatorKeyFromUrl("/1.0/instances/foo")).toBeNull();
    expect(parseReplicatorKeyFromUrl("/1.0/replicators")).toBeNull();
    expect(parseReplicatorKeyFromUrl("/1.0/replicators/%zz")).toBeNull();
  });
});
