import {
  getArchitectureAliases,
  getArchitectureDisplayName,
  getArchitectureTechnicalName,
} from "./architectures";

describe("getArchitectureAliases", () => {
  it("resolves s390x", () => {
    const result = getArchitectureAliases(["s390x"]);

    expect(result.length).toBe(1);
    expect(result.includes("s390x")).toBe(true);
  });

  it("resolves amd64", () => {
    const result = getArchitectureAliases(["x86_64"]);

    expect(result.length).toBe(3);
    expect(result.includes("amd64")).toBe(true);
    expect(result.includes("generic_64")).toBe(true);
    expect(result.includes("x86_64")).toBe(true);
  });

  it("resolves riscv64", () => {
    const result = getArchitectureAliases(["riscv64"]);

    expect(result.length).toBe(1);
    expect(result.includes("riscv64")).toBe(true);
  });

  it("resolves unknown architecture", () => {
    const result = getArchitectureAliases(["unknown-arch"]);

    expect(result.length).toBe(1);
    expect(result.includes("unknown-arch")).toBe(true);
  });
});

describe("getArchitectureDisplayName", () => {
  it("converts x86_64 to amd64", () => {
    const result = getArchitectureDisplayName("x86_64");

    expect(result).toBe("amd64");
  });

  it("converts aarch64 to arm64", () => {
    const result = getArchitectureDisplayName("aarch64");

    expect(result).toBe("arm64");
  });

  it("converts i686 to i386", () => {
    const result = getArchitectureDisplayName("i686");

    expect(result).toBe("i386");
  });

  it("converts armv7l to armhf", () => {
    const result = getArchitectureDisplayName("armv7l");

    expect(result).toBe("armhf");
  });

  it("converts ppc64le to ppc64el", () => {
    const result = getArchitectureDisplayName("ppc64le");

    expect(result).toBe("ppc64el");
  });

  it("handles architecture without aliases", () => {
    const result = getArchitectureDisplayName("s390x");

    expect(result).toBe("s390x");
  });

  it("handles architecture with empty aliases", () => {
    const result = getArchitectureDisplayName("riscv64");

    expect(result).toBe("riscv64");
  });

  it("handles unknown architecture", () => {
    const result = getArchitectureDisplayName("unknown-arch");

    expect(result).toBe("unknown-arch");
  });
});

describe("getArchitectureTechnicalName", () => {
  it("converts amd64 to x86_64", () => {
    const result = getArchitectureTechnicalName("amd64");

    expect(result).toBe("x86_64");
  });

  it("converts arm64 to aarch64", () => {
    const result = getArchitectureTechnicalName("arm64");

    expect(result).toBe("aarch64");
  });

  it("converts i386 to i686", () => {
    const result = getArchitectureTechnicalName("i386");

    expect(result).toBe("i686");
  });

  it("converts armhf to armv7l", () => {
    const result = getArchitectureTechnicalName("armhf");

    expect(result).toBe("armv7l");
  });

  it("converts ppc64el to ppc64le", () => {
    const result = getArchitectureTechnicalName("ppc64el");

    expect(result).toBe("ppc64le");
  });

  it("converts generic_64 to x86_64", () => {
    const result = getArchitectureTechnicalName("generic_64");

    expect(result).toBe("x86_64");
  });

  it("converts 386 to i686", () => {
    const result = getArchitectureTechnicalName("386");

    expect(result).toBe("i686");
  });

  it("handles alias not in any architecture", () => {
    const result = getArchitectureTechnicalName("unknown-arch");

    expect(result).toBe("unknown-arch");
  });

  it("handles technical name passed as input", () => {
    const result = getArchitectureTechnicalName("x86_64");

    expect(result).toBe("x86_64");
  });
});
