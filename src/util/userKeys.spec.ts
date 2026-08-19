import {
  anchorUserKeys,
  getEffectiveUserKeys,
  getInheritedUserKeys,
  getUserKeyErrors,
  getUserKeyNameError,
  getUserKeyRows,
  isIncompleteUserKey,
  parseUserKeys,
  userKeysValidation,
} from "util/userKeys";
import { UI_TERMINAL_DEFAULT_PAYLOAD } from "util/instanceTerminal";
import type { LxdInstance } from "types/instance";
import type { LxdProfile } from "types/profile";
import type {
  EditInstanceFormValues,
  UserKey,
} from "types/forms/instanceAndProfile";

const asProfile = (name: string, config: Record<string, string>) =>
  ({ name, config, devices: {} }) as unknown as LxdProfile;

const asInstance = (
  config: Record<string, string>,
  expandedConfig?: Record<string, string>,
  profiles: string[] = [],
) =>
  ({
    config,
    expanded_config: expandedConfig ?? config,
    profiles,
    devices: {},
  }) as unknown as LxdInstance;

describe("parseUserKeys", () => {
  it("parses user keys and strips the prefix", () => {
    const instance = asInstance({
      "user.owner": "alice",
      "limits.cpu": "2",
      "user.enabled": "false",
    });

    expect(parseUserKeys(instance)).toEqual([
      { key: "enabled", value: "false" },
      { key: "owner", value: "alice" },
    ]);
  });

  it("keeps empty values and ui specific keys", () => {
    const instance = asInstance({
      "user.empty": "",
      [UI_TERMINAL_DEFAULT_PAYLOAD]: '{"command":"bash"}',
    });

    expect(parseUserKeys(instance)).toEqual([
      { key: "empty", value: "" },
      { key: "ui_terminal_default_payload", value: '{"command":"bash"}' },
    ]);
  });

  it("keeps long values intact", () => {
    const value = "x".repeat(500);
    const instance = asInstance({ "user.blob": value });

    expect(parseUserKeys(instance)).toEqual([{ key: "blob", value }]);
  });
});

describe("getInheritedUserKeys", () => {
  const profiles = [
    asProfile("default", { "user.owner": "from-default", "user.env": "prod" }),
    asProfile("extra", {
      "user.owner": "from-extra",
      [UI_TERMINAL_DEFAULT_PAYLOAD]: "{}",
    }),
  ];

  const values = {
    entityType: "instance",
    profiles: ["default", "extra"],
  } as unknown as EditInstanceFormValues;

  it("lets the last applied profile win", () => {
    expect(getInheritedUserKeys(values, profiles)).toEqual([
      { userKey: { key: "owner", value: "from-extra" }, source: "extra" },
      {
        userKey: { key: "ui_terminal_default_payload", value: "{}" },
        source: "extra",
      },
      { userKey: { key: "env", value: "prod" }, source: "default" },
    ]);
  });

  it("returns nothing for a profile form", () => {
    const profileValues = {
      entityType: "profile",
    } as unknown as EditInstanceFormValues;

    expect(getInheritedUserKeys(profileValues, profiles)).toEqual([]);
  });
});

describe("getUserKeyRows", () => {
  const inherited = [
    { userKey: { key: "beta", value: "from-profile" }, source: "default" },
    { userKey: { key: "yankee", value: "from-profile" }, source: "default" },
  ];

  const asOrder = (userKeys: UserKey[], inheritedKeys = inherited) =>
    getUserKeyRows(userKeys, inheritedKeys).map((row) =>
      row.type === "inherited"
        ? `inherited:${row.userKey.key}`
        : `local:${row.userKey.key}:${row.index}`,
    );

  it("merges local and inherited keys alphabetically", () => {
    const userKeys = anchorUserKeys([
      { key: "alpha", value: "1" },
      { key: "zulu", value: "2" },
    ]);

    expect(asOrder(userKeys)).toEqual([
      "local:alpha:0",
      "inherited:beta",
      "inherited:yankee",
      "local:zulu:1",
    ]);
  });

  it("renders an override right below the key it shadows", () => {
    const userKeys = anchorUserKeys([
      { key: "alpha", value: "1" },
      { key: "beta", value: "override" },
    ]);

    expect(asOrder(userKeys)).toEqual([
      "local:alpha:0",
      "inherited:beta",
      "local:beta:1",
      "inherited:yankee",
    ]);
  });

  it("keeps a row added during this edit at the bottom while it is typed in", () => {
    const anchored = anchorUserKeys([{ key: "alpha", value: "1" }]);

    // a row without an anchor sorts last, whatever key is typed into it
    expect(asOrder(anchored.concat({ key: "", value: "" }))).toEqual([
      "local:alpha:0",
      "inherited:beta",
      "inherited:yankee",
      "local::1",
    ]);
    expect(asOrder(anchored.concat({ key: "charlie", value: "" }))).toEqual([
      "local:alpha:0",
      "inherited:beta",
      "inherited:yankee",
      "local:charlie:1",
    ]);
  });

  it("does not move a row when its key is renamed", () => {
    const userKeys = anchorUserKeys([
      { key: "alpha", value: "1" },
      { key: "zulu", value: "2" },
    ]);
    const renamed = userKeys.map((userKey) =>
      userKey.key === "alpha" ? { ...userKey, key: "zzz" } : userKey,
    );

    expect(asOrder(renamed)).toEqual([
      "local:zzz:0",
      "inherited:beta",
      "inherited:yankee",
      "local:zulu:1",
    ]);
  });

  it("returns the local rows in order when nothing is inherited", () => {
    const userKeys = anchorUserKeys([
      { key: "alpha", value: "1" },
      { key: "zulu", value: "2" },
    ]).concat({ key: "charlie", value: "3" });

    expect(asOrder(userKeys, [])).toEqual([
      "local:alpha:0",
      "local:zulu:1",
      "local:charlie:2",
    ]);
  });
});

describe("getEffectiveUserKeys", () => {
  it("returns local and inherited keys in one sorted list", () => {
    const instance = asInstance(
      { "user.owner": "alice" },
      { "user.owner": "alice", "user.env": "prod" },
      ["default"],
    );

    expect(getEffectiveUserKeys(instance)).toEqual([
      { key: "env", value: "prod" },
      { key: "owner", value: "alice" },
    ]);
  });

  it("falls back to the local config when nothing is expanded", () => {
    const instance = {
      config: { "user.owner": "alice" },
      profiles: [],
    } as unknown as LxdInstance;

    expect(getEffectiveUserKeys(instance)).toEqual([
      { key: "owner", value: "alice" },
    ]);
  });
});

describe("getUserKeyNameError", () => {
  it("accepts a valid key", () => {
    expect(getUserKeyNameError("owner", ["env"])).toBeUndefined();
  });

  it("rejects invalid keys", () => {
    expect(getUserKeyNameError("my key", [])).toBe(
      "Key must not contain whitespace",
    );
    expect(getUserKeyNameError("a=b", [])).toBe(
      "Key must not contain an equals sign",
    );
    expect(getUserKeyNameError("user.owner", [])).toBe(
      "The user. prefix is added automatically",
    );
    expect(getUserKeyNameError("owner", ["owner"])).toBe(
      "This key already exists",
    );
  });
});

describe("isIncompleteUserKey", () => {
  it("detects rows without a key", () => {
    expect(isIncompleteUserKey({ key: "", value: "" })).toBe(true);
    expect(isIncompleteUserKey({ key: "", value: "alice" })).toBe(true);
    expect(isIncompleteUserKey({ key: "   ", value: "alice" })).toBe(true);
  });

  it("detects rows without a value", () => {
    expect(isIncompleteUserKey({ key: "owner", value: "" })).toBe(true);
  });

  it("keeps rows with both halves filled in", () => {
    expect(isIncompleteUserKey({ key: "owner", value: "alice" })).toBe(false);
    expect(isIncompleteUserKey({ key: "owner", value: " " })).toBe(false);
  });
});

describe("getUserKeyErrors", () => {
  it("ignores rows that are still blank", () => {
    expect(getUserKeyErrors([{ key: "", value: "" }])).toEqual([undefined]);
  });

  it("does not block a row with a value but no key", () => {
    expect(getUserKeyErrors([{ key: "", value: "alice" }])).toEqual([
      undefined,
    ]);
  });

  it("ignores rows without a key when detecting duplicates", () => {
    expect(
      getUserKeyErrors([
        { key: "", value: "alice" },
        { key: "owner", value: "bob" },
      ]),
    ).toEqual([undefined, undefined]);
  });

  it("flags the second occurrence of a duplicate", () => {
    expect(
      getUserKeyErrors([
        { key: "owner", value: "alice" },
        { key: "owner", value: "bob" },
      ]),
    ).toEqual([undefined, "This key already exists"]);
  });

  it("validates the key of a row that has no value yet", () => {
    expect(
      getUserKeyErrors([
        { key: "owner", value: "" },
        { key: "owner", value: "bob" },
      ]),
    ).toEqual([undefined, "This key already exists"]);
    expect(getUserKeyErrors([{ key: "two words", value: "" }])).toEqual([
      "Key must not contain whitespace",
    ]);
  });
});

describe("userKeysValidation", () => {
  it("accepts a blank row that formik stripped to an empty object", () => {
    expect(userKeysValidation.isValidSync([{}])).toBe(true);
  });

  it("accepts a row that formik stripped down to its value", () => {
    expect(userKeysValidation.isValidSync([{ value: "alice" }])).toBe(true);
  });

  it("rejects a row with a duplicate key", () => {
    expect(
      userKeysValidation.isValidSync([
        { key: "owner", value: "alice" },
        { key: "owner", value: "bob" },
      ]),
    ).toBe(false);
  });
});
