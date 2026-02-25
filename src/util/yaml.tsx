import { dump as dumpYaml, load as loadYaml } from "js-yaml";
import type { LxdInstance } from "types/instance";
import type { LxdProfile } from "types/profile";

export const yamlToObject = (yamlString: string): object => {
  return loadYaml(yamlString.trim()) as object;
};

export const objectToYaml = (obj: object): string => {
  return dumpYaml(obj, { lineWidth: -1 });
};

const getSourceProfile = (
  profileNames: string[],
  allProfiles: LxdProfile[],
  key: string,
  deviceName?: string,
): string => {
  const source = profileNames.find((pName) => {
    const p = allProfiles.find((profile) => profile.name === pName);
    if (deviceName) {
      const device = p?.devices?.[deviceName];
      return (
        device &&
        (device as unknown as Record<string, unknown>)[key] !== undefined
      );
    }
    return p?.config?.[key] !== undefined;
  });
  return source || "profile";
};

export const expandInheritedValuesYaml = (
  instance: LxdInstance,
  profiles: LxdProfile[],
): string => {
  const reversedProfiles = [...(instance.profiles || [])].reverse();
  const sections: string[] = [];

  const exclude = [
    "config",
    "devices",
    "expanded_config",
    "expanded_devices",
    "backups",
    "snapshots",
    "state",
    "etag",
  ];

  const metadata = Object.fromEntries(
    Object.entries(instance).filter(([key]) => !exclude.includes(key)),
  );

  sections.push(objectToYaml(metadata).trim());

  const expandedConfig = instance.expanded_config || {};
  const localConfig = instance.config || {};

  if (Object.keys(expandedConfig).length > 0) {
    sections.push("config:");
    Object.entries(expandedConfig).forEach(([key, value]) => {
      const isLocal = Object.prototype.hasOwnProperty.call(localConfig, key);

      if (!isLocal && (value === "" || value === null)) {
        const source = getSourceProfile(reversedProfiles, profiles, key);
        sections.push(`  ${key}: "" # inherited from profile: ${source}`);
        return;
      }

      let entryYaml = objectToYaml({ [key]: value }).trimEnd();

      if (!isLocal) {
        const source = getSourceProfile(reversedProfiles, profiles, key);
        const lines = entryYaml.split("\n");
        lines[0] = `${lines[0]} # inherited from profile: ${source}`;
        entryYaml = lines.join("\n");
      }

      const padding = String(value).includes("\n") ? "\n" : "";
      sections.push(entryYaml.replace(/^/gm, "  ") + padding);
    });
  }

  const expandedDevices = instance.expanded_devices || {};
  const localDevices = instance.devices || {};

  if (Object.keys(expandedDevices).length > 0) {
    sections.push("devices:");
    Object.entries(expandedDevices).forEach(([name, config]) => {
      const localDevice = localDevices[name];

      if (!localDevice) {
        // Entire device block is inherited
        const source = getSourceProfile(
          reversedProfiles,
          profiles,
          "type",
          name,
        );
        sections.push(`  ${name}: # inherited from profile: ${source}`);
        sections.push(
          objectToYaml(config).replace(/^/gm, "    ").trimEnd() + "\n",
        );
      } else {
        // Local device: properties might be inherited
        sections.push(`  ${name}:`);
        Object.entries(config as unknown as Record<string, unknown>).forEach(
          ([propKey, propVal]) => {
            const isLocalProp = Object.prototype.hasOwnProperty.call(
              localDevice,
              propKey,
            );
            let propYaml = objectToYaml({ [propKey]: propVal }).trimEnd();

            if (!isLocalProp) {
              const source = getSourceProfile(
                reversedProfiles,
                profiles,
                propKey,
                name,
              );
              const lines = propYaml.split("\n");
              lines[0] = `${lines[0]} # inherited from profile: ${source}`;
              propYaml = lines.join("\n");
            }

            const padding = String(propVal).includes("\n") ? "\n" : "";
            sections.push(propYaml.replace(/^/gm, "    ") + padding);
          },
        );
      }
    });
  }

  return sections
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
