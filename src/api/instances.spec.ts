import { addRecursion, instanceFields } from "./instances";

describe("addRecursion", () => {
  it("uses selective recursion when not fine-grained", () => {
    const params = new URLSearchParams();
    addRecursion(params, false);
    expect(params.get("recursion")).toBe(
      `2;fields=${instanceFields.join(",")}`,
    );
  });

  it("falls back to plain recursion when fine-grained permissions are enabled", () => {
    // Server doesn't support selective recursion with entitlements
    const params = new URLSearchParams();
    addRecursion(params, true);
    expect(params.get("recursion")).toBe("2");
  });

  it("uses selective recursion when isFineGrained is null", () => {
    const params = new URLSearchParams();
    addRecursion(params, null);
    expect(params.get("recursion")).toBe(
      `2;fields=${instanceFields.join(",")}`,
    );
  });
});
