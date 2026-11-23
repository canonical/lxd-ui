import type { LxdConfigPair } from "types/config";

// Supports the config filters of lxc list, e.g. "user.owner=alice".
// Like in lxc list, an empty value matches when the key is not set.
export const configMatchesQuery = (
  config: LxdConfigPair,
  query: string,
): boolean => {
  const [key, ...valueParts] = query.toLowerCase().split("=");
  const configKey = key.trim();
  if (!configKey || valueParts.length === 0) {
    return false;
  }

  const matchingKey = Object.keys(config).find(
    (item) => item.toLowerCase() === configKey,
  );
  const configValue = matchingKey ? (config[matchingKey] ?? "") : "";

  return configValue.toLowerCase() === valueParts.join("=").trim();
};
