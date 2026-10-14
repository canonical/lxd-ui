import {
  getRegistryRestrictionMode,
  isRegistryAllowedInProject,
  loadImagesFromBuiltInRegistries,
  loadImagesFromRegistry,
} from "util/imageRegistry";
import {
  fetchImageRegistries,
  fetchRegistryImages,
} from "api/image-registries";
import type { LxdImage, LxdImageRegistry } from "types/image";
import type { LxdProject } from "types/project";

vi.mock("api/image-registries", () => ({
  fetchImageRegistries: vi.fn(),
  fetchRegistryImages: vi.fn(),
}));

const project = (config: Record<string, string>) =>
  ({ name: "p", config }) as unknown as LxdProject;

const builtin = { name: "ubuntu", builtin: true, public: true };
const custom = { name: "my-reg", builtin: false, public: true };

const customRegistry: LxdImageRegistry = {
  ...custom,
  description: "",
  protocol: "simplestreams",
};

const lxdImage = {
  fingerprint: "abc",
  public: false,
  architecture: "x86_64",
  type: "container",
  size: 1,
  uploaded_at: "2024-01-01T00:00:00Z",
  aliases: [{ name: "my-image", description: "" }],
  cached: false,
  properties: { os: "ubuntu", release: "jammy" },
} as LxdImage;

const registries: LxdImageRegistry[] = [
  { ...builtin, description: "", protocol: "simplestreams" },
  { ...custom, description: "", protocol: "simplestreams" },
  {
    name: "images",
    builtin: true,
    public: true,
    description: "",
    protocol: "simplestreams",
  },
];

describe("loadImagesFromBuiltInRegistries", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(fetchRegistryImages).mockResolvedValue([]);
  });

  it("returns an empty result without fetching images when all registries are blocked", async () => {
    const result = await loadImagesFromBuiltInRegistries(
      registries,
      false,
      project({ restricted: "true", "restricted.registries": "block" }),
    );
    expect(result).toEqual({ images: [], error: "" });
    expect(fetchRegistryImages).not.toHaveBeenCalled();
  });

  it("does not load custom registries even when they are allowed", async () => {
    const result = await loadImagesFromBuiltInRegistries(
      registries,
      false,
      project({ restricted: "true", "restricted.registries": "my-reg" }),
    );
    expect(result).toEqual({ images: [], error: "" });
    expect(fetchRegistryImages).not.toHaveBeenCalled();
  });

  it("prefixes errors with the registry name and keeps other working built-in registries", async () => {
    vi.mocked(fetchRegistryImages)
      .mockRejectedValueOnce(new Error("error"))
      .mockResolvedValueOnce([lxdImage]);
    const result = await loadImagesFromBuiltInRegistries(
      registries.map((registry) =>
        registry.name === "images"
          ? { ...registry, name: "other-builtin" }
          : registry,
      ),
      false,
      project({}),
    );
    expect(result.error).toBe("ubuntu: error");
    expect(result.images).toHaveLength(1);
    expect(result.images[0].registryName).toBe("other-builtin");
  });

  it("loads only supplied built-in registries without fetching the list", async () => {
    const result = await loadImagesFromBuiltInRegistries(
      registries,
      false,
      project({}),
    );
    expect(result).toEqual({ images: [], error: "" });
    expect(fetchRegistryImages).toHaveBeenCalledTimes(2);
    expect(fetchRegistryImages).toHaveBeenCalledWith("ubuntu", false);
    expect(fetchRegistryImages).toHaveBeenCalledWith("images", false);
    expect(fetchImageRegistries).not.toHaveBeenCalled();
  });
});

describe("loadImagesFromRegistry", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(fetchRegistryImages).mockResolvedValue([]);
  });

  it("returns an empty result without fetching images when the registry is blocked", async () => {
    const result = await loadImagesFromRegistry(
      customRegistry,
      false,
      project({ restricted: "true", "restricted.registries": "block" }),
    );
    expect(result).toEqual({ images: [], error: "" });
    expect(fetchRegistryImages).not.toHaveBeenCalled();
  });

  it("loads images from the registry", async () => {
    vi.mocked(fetchRegistryImages).mockResolvedValue([lxdImage]);
    const result = await loadImagesFromRegistry(
      customRegistry,
      false,
      project({}),
    );
    expect(result.error).toBe("");
    expect(result.images).toHaveLength(1);
    expect(result.images[0].registryName).toBe("my-reg");
    expect(result.images[0].registryBuiltIn).toBe(false);
    expect(fetchRegistryImages).toHaveBeenCalledWith("my-reg", false);
    expect(fetchImageRegistries).not.toHaveBeenCalled();
  });

  it("returns the error message when fetching fails", async () => {
    vi.mocked(fetchRegistryImages).mockRejectedValue(new Error("error"));
    const result = await loadImagesFromRegistry(customRegistry, false);
    expect(result).toEqual({ images: [], error: "error" });
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
