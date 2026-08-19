import type { LxdInstance } from "types/instance";
import type { LxdProfile } from "types/profile";
import type {
  InstanceAndProfileFormValues,
  UserKey,
} from "types/forms/instanceAndProfile";
import { getAppliedProfiles } from "util/profiles";

export const USER_KEY_PREFIX = "user.";

const INTERNAL_USER_KEY_PREFIX = "user.ui_";
const INTERNAL_USER_KEYS = new Set(["user.grafana_base_url"]);

export const isInternalUserKey = (fullKey: string): boolean => {
  return (
    fullKey.startsWith(INTERNAL_USER_KEY_PREFIX) ||
    INTERNAL_USER_KEYS.has(fullKey)
  );
};

export const toFullUserKey = (key: string): string => {
  return `${USER_KEY_PREFIX}${key}`;
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

export const visibleUserKeys = (userKeys: UserKey[]): UserKey[] => {
  return userKeys.filter((item) => !isInternalUserKey(toFullUserKey(item.key)));
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
    visibleUserKeys(parseUserKeys(profile)).forEach((userKey) => {
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

export const getEffectiveUserKeys = (instance: LxdInstance): UserKey[] => {
  const config = instance.expanded_config ?? instance.config;

  return Object.keys(config)
    .filter((key) => key.startsWith(USER_KEY_PREFIX) && !isInternalUserKey(key))
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
  if (name.length === 0) {
    return "Key is required";
  }
  if (/\s/.test(name)) {
    return "Key must not contain whitespace";
  }
  if (name.includes("=")) {
    return "Key must not contain an equals sign";
  }
  if (isInternalUserKey(toFullUserKey(name))) {
    return "This key is reserved for LXD-UI";
  }
  if (existingKeys.includes(name)) {
    return "This key already exists";
  }
  return undefined;
};
