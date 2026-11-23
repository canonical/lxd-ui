import { configMatchesQuery } from "./configQuery";

const config = {
  "user.team": "Blue",
  "limits.cpu": "2",
};

describe("configMatchesQuery", () => {
  it("matches a config key with its value, ignoring case", () => {
    expect(configMatchesQuery(config, "user.team=blue")).toBe(true);
    expect(configMatchesQuery(config, "USER.TEAM = Blue")).toBe(true);
    expect(configMatchesQuery(config, "limits.cpu=2")).toBe(true);
  });

  it("requires the whole value to match", () => {
    expect(configMatchesQuery(config, "user.team=blu")).toBe(false);
    expect(configMatchesQuery(config, "user.team=red")).toBe(false);
  });

  it("matches a missing key when the value is empty", () => {
    expect(configMatchesQuery(config, "user.owner=")).toBe(true);
    expect(configMatchesQuery(config, "user.team=")).toBe(false);
  });

  it("ignores queries without a key or without an equals sign", () => {
    expect(configMatchesQuery(config, "=blue")).toBe(false);
    expect(configMatchesQuery(config, "user.team")).toBe(false);
  });
});
