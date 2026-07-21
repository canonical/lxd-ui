import { resolveSymlinkTarget } from "./instances";

describe("resolveSymlinkTarget", () => {
  describe("relative paths", () => {
    it("resolves a sibling target relative to the current path", () => {
      expect(resolveSymlinkTarget("bar", "/home/foo")).toBe("/home/bar");
    });

    it("resolves a target with ..", () => {
      expect(resolveSymlinkTarget("../other", "/home/user/file.txt")).toBe(
        "/home/other",
      );
    });

    it("resolves a target with .", () => {
      expect(resolveSymlinkTarget("./same", "/dir/current")).toBe("/dir/same");
    });

    it("resolves a target with multiple ..", () => {
      expect(resolveSymlinkTarget("../../top", "/a/b/c/d")).toBe("/a/top");
    });
  });

  describe("root (absolute) paths", () => {
    it("returns an absolute target as-is", () => {
      expect(resolveSymlinkTarget("/usr/bin/bash", "/home/user/link")).toBe(
        "/usr/bin/bash",
      );
    });

    it("returns root target as-is", () => {
      expect(resolveSymlinkTarget("/", "/some/deep/path")).toBe("/");
    });

    it("returns an absolute target regardless of currentPath", () => {
      expect(resolveSymlinkTarget("/etc/config", "/")).toBe("/etc/config");
    });
  });

  describe("paths to directories", () => {
    it("resolves a relative directory target", () => {
      expect(resolveSymlinkTarget("subdir", "/var/data/link")).toBe(
        "/var/data/subdir",
      );
    });

    it("returns an absolute directory target as-is", () => {
      expect(resolveSymlinkTarget("/opt/apps", "/home/link")).toBe("/opt/apps");
    });

    it("resolves a relative directory target with ..", () => {
      expect(resolveSymlinkTarget("../logs", "/srv/app/current")).toBe(
        "/srv/logs",
      );
    });
  });

  describe("paths to files", () => {
    it("resolves a sibling file target", () => {
      expect(resolveSymlinkTarget("readme.md", "/project/docs/link")).toBe(
        "/project/docs/readme.md",
      );
    });

    it("resolves a file target with ..", () => {
      expect(resolveSymlinkTarget("../src/main.ts", "/project/test/unit")).toBe(
        "/project/src/main.ts",
      );
    });
  });

  describe("paths to other symlinks", () => {
    it("resolves a sibling symlink target", () => {
      expect(resolveSymlinkTarget("link2", "/home/user/link1")).toBe(
        "/home/user/link2",
      );
    });

    it("resolves a relative symlink target with ..", () => {
      expect(resolveSymlinkTarget("../link3", "/a/b/link2")).toBe("/a/link3");
    });

    it("returns an absolute symlink target as-is", () => {
      expect(resolveSymlinkTarget("/absolute/link", "/some/path/link1")).toBe(
        "/absolute/link",
      );
    });
  });

  describe("edge cases", () => {
    it("resolves an empty string target to the parent directory", () => {
      expect(resolveSymlinkTarget("", "/home/user/file")).toBe("/home/user");
    });

    it("resolves against an empty string currentPath as root", () => {
      expect(resolveSymlinkTarget("bar", "")).toBe("/bar");
    });

    it("returns root when both inputs are empty strings", () => {
      expect(resolveSymlinkTarget("", "")).toBe("/");
    });

    it("throws when target is null", () => {
      expect(() =>
        resolveSymlinkTarget(null as unknown as string, "/path"),
      ).toThrow();
    });

    it("throws when currentPath is null", () => {
      expect(() =>
        resolveSymlinkTarget("bar", null as unknown as string),
      ).toThrow();
    });
  });
});
