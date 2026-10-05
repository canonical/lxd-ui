import type { LxdInstance } from "types/instance";
import { instanceMatchesQuery } from "./instanceFilter";

const instance = {
  name: "web-1",
  description: "Frontend server",
  config: {
    "image.description": "Ubuntu noble amd64",
    "user.owner": "Alice",
  },
  expanded_config: {
    "image.description": "Ubuntu noble amd64",
    "user.owner": "Alice",
    "user.team": "blue",
  },
} as unknown as LxdInstance;

describe("instanceMatchesQuery", () => {
  it("matches the name, description and image description", () => {
    expect(instanceMatchesQuery(instance, "web")).toBe(true);
    expect(instanceMatchesQuery(instance, "frontend")).toBe(true);
    expect(instanceMatchesQuery(instance, "noble")).toBe(true);
    expect(instanceMatchesQuery(instance, "database")).toBe(false);
  });

  it("matches a config key with its value", () => {
    expect(instanceMatchesQuery(instance, "user.owner=alice")).toBe(true);
    expect(instanceMatchesQuery(instance, "user.owner=bob")).toBe(false);
  });

  it("matches config keys inherited from profiles", () => {
    expect(instanceMatchesQuery(instance, "user.team=blue")).toBe(true);
  });

  it("ignores case and surrounding whitespace", () => {
    expect(instanceMatchesQuery(instance, "USER.OWNER = ALICE")).toBe(true);
  });

  it("requires the whole value to match", () => {
    expect(instanceMatchesQuery(instance, "user.owner=ali")).toBe(false);
  });

  it("matches instances without the key when the value is empty", () => {
    expect(instanceMatchesQuery(instance, "user.backup=")).toBe(true);
    expect(instanceMatchesQuery(instance, "user.owner=")).toBe(false);
  });

  it("does not treat a query without a key as a config filter", () => {
    expect(instanceMatchesQuery(instance, "=alice")).toBe(false);
  });
});
