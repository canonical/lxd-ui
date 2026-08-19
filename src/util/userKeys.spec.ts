import {
  getEffectiveUserKeys,
  getInheritedUserKeys,
  getUserKeyNameError,
  isInternalUserKey,
  parseUserKeys,
} from "util/userKeys";
import { UI_TERMINAL_DEFAULT_PAYLOAD } from "util/instanceTerminal";
import type { LxdInstance } from "types/instance";
import type { LxdProfile } from "types/profile";
import type { EditInstanceFormValues } from "types/forms/instanceAndProfile";

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

describe("isInternalUserKey", () => {
  it("hides the ui_ namespace", () => {
    expect(isInternalUserKey(UI_TERMINAL_DEFAULT_PAYLOAD)).toBe(true);
    expect(isInternalUserKey("user.ui_theme")).toBe(true);
    expect(isInternalUserKey("user.grafana_base_url")).toBe(true);
  });

  it("keeps regular user keys", () => {
    expect(isInternalUserKey("user.owner")).toBe(false);
    expect(isInternalUserKey("user.uid")).toBe(false);
  });
});

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

  it("keeps empty values and internal keys", () => {
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

  it("omits internal keys", () => {
    const instance = asInstance({
      "user.owner": "alice",
      [UI_TERMINAL_DEFAULT_PAYLOAD]: "{}",
    });

    expect(getEffectiveUserKeys(instance).map((item) => item.key)).toEqual([
      "owner",
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
    expect(getUserKeyNameError("", [])).toBe("Key is required");
    expect(getUserKeyNameError("my key", [])).toBe(
      "Key must not contain whitespace",
    );
    expect(getUserKeyNameError("a=b", [])).toBe(
      "Key must not contain an equals sign",
    );
    expect(getUserKeyNameError("ui_theme", [])).toBe(
      "This key is reserved for LXD-UI",
    );
    expect(getUserKeyNameError("owner", ["owner"])).toBe(
      "This key already exists",
    );
  });
});
