import { valueAsNumber } from "util/valueAsNumber";

describe("valueAsNumber", () => {
  it("returns undefined for an empty string", () => {
    expect(valueAsNumber("")).toBeUndefined();
  });

  it("returns undefined for non-numeric values", () => {
    expect(valueAsNumber("abc")).toBeUndefined();
  });

  it("parses valid numeric strings", () => {
    expect(valueAsNumber("0")).toBe(0);
    expect(valueAsNumber("42")).toBe(42);
    expect(valueAsNumber("3.14")).toBe(3.14);
    expect(valueAsNumber("-7")).toBe(-7);
  });
});
