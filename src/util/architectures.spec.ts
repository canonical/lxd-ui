import { getArchitectureAliases } from "./architectures";

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
