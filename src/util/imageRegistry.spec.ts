import {
  getRegistryRestrictionMode,
  isRegistryAllowedInProject,
} from "util/imageRegistry";
import type { LxdProject } from "types/project";

const project = (config: Record<string, string>) =>
  ({ name: "p", config }) as unknown as LxdProject;

const builtin = { name: "ubuntu", builtin: true };
const custom = { name: "my-reg", builtin: false };

describe("getRegistryRestrictionMode", () => {
  it("maps values to modes", () => {
    expect(getRegistryRestrictionMode(undefined)).toBe("builtin");
    expect(getRegistryRestrictionMode("")).toBe("builtin");
    expect(getRegistryRestrictionMode("builtin")).toBe("builtin");
    expect(getRegistryRestrictionMode("allow")).toBe("allow");
    expect(getRegistryRestrictionMode("block")).toBe("block");
    expect(getRegistryRestrictionMode("builtin,my-reg")).toBe("custom");
    expect(getRegistryRestrictionMode("my-reg")).toBe("custom");
  });
});

describe("isRegistryAllowedInProject", () => {
  it("allows everything in unrestricted projects", () => {
    const p = project({ "restricted.registries": "block" });
    expect(isRegistryAllowedInProject(custom, p)).toBe(true);
    expect(isRegistryAllowedInProject(custom, undefined)).toBe(true);
  });

  it("defaults to built-in registries only", () => {
    const p = project({ restricted: "true" });
    expect(isRegistryAllowedInProject(builtin, p)).toBe(true);
    expect(isRegistryAllowedInProject(custom, p)).toBe(false);
  });

  it("handles allow and block keywords", () => {
    const allow = project({
      restricted: "true",
      "restricted.registries": "allow",
    });
    const block = project({
      restricted: "true",
      "restricted.registries": "block",
    });
    expect(isRegistryAllowedInProject(custom, allow)).toBe(true);
    expect(isRegistryAllowedInProject(builtin, block)).toBe(false);
  });

  it("handles custom lists with and without the builtin keyword", () => {
    const onlyCustom = project({
      restricted: "true",
      "restricted.registries": "my-reg",
    });
    const mixed = project({
      restricted: "true",
      "restricted.registries": "builtin,my-reg",
    });
    expect(isRegistryAllowedInProject(builtin, onlyCustom)).toBe(false);
    expect(isRegistryAllowedInProject(custom, onlyCustom)).toBe(true);
    expect(isRegistryAllowedInProject(builtin, mixed)).toBe(true);
    expect(
      isRegistryAllowedInProject({ name: "other", builtin: false }, mixed),
    ).toBe(false);
  });
});
