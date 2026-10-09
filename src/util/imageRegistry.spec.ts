import {
  getRegistryRestrictionMode,
  isRegistryAllowedInProject,
  loadImagesFromAllRegistries,
} from "util/imageRegistry";
import {
  fetchImageRegistries,
  fetchRegistryImages,
} from "api/image-registries";
import type { LxdProject } from "types/project";

vi.mock("api/image-registries", () => ({
  fetchImageRegistries: vi.fn(),
  fetchRegistryImages: vi.fn(),
}));

const project = (config: Record<string, string>) =>
  ({ name: "p", config }) as unknown as LxdProject;

const builtin = { name: "ubuntu", builtin: true, public: true };
const custom = { name: "my-reg", builtin: false, public: true };

describe("loadImagesFromAllRegistries", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(fetchImageRegistries).mockResolvedValue([
      { ...builtin, description: "", protocol: "simplestreams" },
      { ...custom, description: "", protocol: "simplestreams" },
    ]);
    vi.mocked(fetchRegistryImages).mockResolvedValue([]);
  });

  it("returns an empty result without fetching images when all registries are blocked", async () => {
    const result = await loadImagesFromAllRegistries(
      false,
      project({ restricted: "true", "restricted.registries": "block" }),
    );
    expect(result).toEqual({ images: [], error: "" });
    expect(fetchRegistryImages).not.toHaveBeenCalled();
  });

  it("handles a custom-only list without built-in registry buckets", async () => {
    const result = await loadImagesFromAllRegistries(
      false,
      project({ restricted: "true", "restricted.registries": "my-reg" }),
    );
    expect(result).toEqual({ images: [], error: "" });
    expect(fetchRegistryImages).toHaveBeenCalledOnce();
    expect(fetchRegistryImages).toHaveBeenCalledWith("my-reg", false);
  });
});

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

  it("allows only built-in registries for an empty restriction", () => {
    const p = project({ restricted: "true", "restricted.registries": "" });
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
    expect(isRegistryAllowedInProject(custom, block)).toBe(false);
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
