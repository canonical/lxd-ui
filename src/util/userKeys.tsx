import * as Yup from "yup";
import type { LxdInstance } from "types/instance";
import type { LxdProfile } from "types/profile";
import type {
  InstanceAndProfileFormValues,
  UserKey,
} from "types/forms/instanceAndProfile";
import { getAppliedProfiles } from "util/profiles";

export const USER_KEY_PREFIX = "user.";

export const toFullUserKey = (key: string): string => {
  return `${USER_KEY_PREFIX}${key}`;
};

export const hasBlankUserKeyName = (userKey: UserKey): boolean => {
  return userKey.key.trim().length === 0;
};

export const hasBlankUserKeyValue = (userKey: UserKey): boolean => {
  return userKey.value.length === 0;
};

export const isIncompleteUserKey = (userKey: UserKey): boolean => {
  return hasBlankUserKeyName(userKey) || hasBlankUserKeyValue(userKey);
};

export const parseUserKeys = (item: LxdProfile | LxdInstance): UserKey[] => {
  return Object.keys(item.config)
    .filter((key) => key.startsWith(USER_KEY_PREFIX))
    .sort()
    .map((key) => ({
      key: key.slice(USER_KEY_PREFIX.length),
      value: item.config[key] ?? "",
    }));
};

export const anchorUserKeys = (userKeys: UserKey[]): UserKey[] => {
  return userKeys.map((userKey) => ({ ...userKey, sortKey: userKey.key }));
};

export interface InheritedUserKey {
  userKey: UserKey;
  source: string;
}

export const getInheritedUserKeys = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): InheritedUserKey[] => {
  if (values.entityType !== "instance") {
    return [];
  }

  const inherited: InheritedUserKey[] = [];
  for (const profile of getAppliedProfiles(values, profiles)) {
    parseUserKeys(profile).forEach((userKey) => {
      const isShadowed = inherited.some(
        (item) => item.userKey.key === userKey.key,
      );
      if (!isShadowed) {
        inherited.push({ userKey, source: profile.name });
      }
    });
  }

  return inherited;
};

export type UserKeyRow =
  | { type: "inherited"; userKey: UserKey; source: string }
  | { type: "local"; userKey: UserKey; index: number };

// merges the local and the inherited keys into one alphabetical list, so that a
// key overriding an inherited one shows up right below it. local rows sort by
// their anchor, rows added during the current edit have none and render last
export const getUserKeyRows = (
  userKeys: UserKey[],
  inherited: InheritedUserKey[],
): UserKeyRow[] => {
  const anchored = userKeys
    .map((userKey, index) => ({ userKey, index }))
    .filter((item) => item.userKey.sortKey !== undefined)
    // plain comparison, to match the code unit order of parseUserKeys and of
    // the inherited walk below
    .sort((a, b) => {
      if (a.userKey.sortKey === b.userKey.sortKey) {
        return a.index - b.index;
      }
      return (a.userKey.sortKey ?? "") > (b.userKey.sortKey ?? "") ? 1 : -1;
    });

  const sortedInherited = [...inherited].sort((a, b) =>
    a.userKey.key > b.userKey.key ? 1 : -1,
  );

  const rows: UserKeyRow[] = [];
  let inheritedIndex = 0;

  const addInheritedUpTo = (anchor?: string) => {
    while (
      inheritedIndex < sortedInherited.length &&
      (anchor === undefined ||
        sortedInherited[inheritedIndex].userKey.key <= anchor)
    ) {
      const { userKey, source } = sortedInherited[inheritedIndex];
      rows.push({ type: "inherited", userKey, source });
      inheritedIndex++;
    }
  };

  anchored.forEach(({ userKey, index }) => {
    addInheritedUpTo(userKey.sortKey);
    rows.push({ type: "local", userKey, index });
  });
  addInheritedUpTo();

  userKeys.forEach((userKey, index) => {
    if (userKey.sortKey === undefined) {
      rows.push({ type: "local", userKey, index });
    }
  });

  return rows;
};

export const getEffectiveUserKeys = (instance: LxdInstance): UserKey[] => {
  const config = instance.expanded_config ?? instance.config;

  return Object.keys(config)
    .filter((key) => key.startsWith(USER_KEY_PREFIX))
    .sort()
    .map((key) => ({
      key: key.slice(USER_KEY_PREFIX.length),
      value: config[key] ?? "",
    }));
};

export const getUserKeyNameError = (
  name: string,
  existingKeys: string[],
): string | undefined => {
  if (/\s/.test(name)) {
    return "Key must not contain whitespace";
  }
  if (name.includes("=")) {
    return "Key must not contain an equals sign";
  }
  if (name.startsWith(USER_KEY_PREFIX)) {
    return "The user. prefix is added automatically";
  }
  if (existingKeys.includes(name)) {
    return "This key already exists";
  }
  return undefined;
};

export const getUserKeyErrors = (
  userKeys: UserKey[],
): (string | undefined)[] => {
  const seenKeys: string[] = [];

  return userKeys.map((userKey) => {
    if (hasBlankUserKeyName(userKey)) {
      return undefined;
    }
    const error = getUserKeyNameError(userKey.key, seenKeys);
    seenKeys.push(userKey.key);
    return error;
  });
};

const normalizeUserKeys = (userKeys: unknown): UserKey[] => {
  return ((userKeys ?? []) as Partial<UserKey>[]).map((userKey) => ({
    key: userKey.key ?? "",
    value: userKey.value ?? "",
  }));
};

export const userKeysValidation = Yup.array().test(
  "valid-user-keys",
  "Some user keys are invalid",
  (userKeys) => {
    return getUserKeyErrors(normalizeUserKeys(userKeys)).every(
      (error) => error === undefined,
    );
  },
);
