import { intersection } from "util/intersection";

describe("intersection of string arrays", () => {
  it("returns items in all lists, when they are equal", () => {
    const list1 = ["a", "b", "c"];
    const list2 = ["a", "b", "c"];
    const list3 = ["a", "b", "c"];

    const result = intersection([list1, list2, list3]);

    expect(JSON.stringify(result)).toBe(JSON.stringify(["a", "b", "c"]));
  });

  it("avoids items missing in one of the lists", () => {
    const list1 = ["a", "b", "c"];
    const list2 = ["a", "c"];
    const list3 = ["a", "b"];

    const result = intersection([list1, list2, list3]);

    expect(JSON.stringify(result)).toBe(JSON.stringify(["a"]));
  });

  it("returns empty on no overlap", () => {
    const list1 = ["b", "c"];
    const list2 = ["a", "c"];
    const list3 = ["a", "b"];

    const result = intersection([list1, list2, list3]);

    expect(JSON.stringify(result)).toBe(JSON.stringify([]));
  });
});
