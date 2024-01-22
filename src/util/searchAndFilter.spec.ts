import { paramsFromSearchData, searchParamsToChips } from "./searchAndFilter";

describe("paramsFromSearchData and searchParamsToChips", () => {
  it("translates searchdata to url params", () => {
    const searchData = [
      { quoteValue: true, value: "homer" },
      { quoteValue: true, value: "simpson" },
      { lead: "foo", value: "foo1" },
      { lead: "foo", value: "foo2" },
      { lead: "bar", value: "bar1" },
    ];
    const searchParams = new URLSearchParams();
    const queryParams = ["query", "foo", "bar", "baz"];

    const results = paramsFromSearchData(searchData, searchParams, queryParams);

    expect(results.getAll("query").length).toBe(2);
    expect(results.getAll("query")[0]).toBe("homer");
    expect(results.getAll("query")[1]).toBe("simpson");
    expect(results.getAll("foo").length).toBe(2);
    expect(results.getAll("foo")[0]).toBe("foo1");
    expect(results.getAll("foo")[1]).toBe("foo2");
    expect(results.getAll("bar").length).toBe(1);
    expect(results.getAll("bar")[0]).toBe("bar1");
    expect(results.getAll("baz").length).toBe(0);
  });

  it("preserves other url params", () => {
    const searchData = [
      { quoteValue: true, value: "homer" },
      { lead: "foo", value: "foo1" },
    ];
    const searchParams = new URLSearchParams();
    searchParams.set("keepMe", "keepMeValue");
    const queryParams = ["query", "foo", "bar"];

    const results = paramsFromSearchData(searchData, searchParams, queryParams);

    expect(results.getAll("query").length).toBe(1);
    expect(results.getAll("query")[0]).toBe("homer");
    expect(results.getAll("foo").length).toBe(1);
    expect(results.getAll("foo")[0]).toBe("foo1");
    expect(results.getAll("bar").length).toBe(0);
    expect(results.getAll("keepMe").length).toBe(1);
    expect(results.getAll("keepMe")[0]).toBe("keepMeValue");
  });

  it("translates url params to search chips", () => {
    const searchParams = new URLSearchParams();
    searchParams.append("query", "homer");
    searchParams.append("query", "simpson");
    searchParams.append("foo", "foo1");
    searchParams.append("otherValue", "ignoreMe");
    const queryParams = ["query", "foo", "bar", "baz"];

    const results = searchParamsToChips(searchParams, queryParams);

    expect(results.length).toBe(3);
    expect(results[0].quoteValue).toBe(true);
    expect(results[0].value).toBe("homer");
    expect(results[1].quoteValue).toBe(true);
    expect(results[1].value).toBe("simpson");
    expect(results[2].lead).toBe("foo");
    expect(results[2].value).toBe("foo1");
  });
});
