import type { LxdSettings } from "types/server";
import type { ConfigField, LxdConfigPair } from "types/config";
import type { LXDSettingOnClusterMember } from "types/server";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";

import { getDefaultProject } from "util/loginProject";
import type { LxdProject } from "types/project";

export type UserSetting = ConfigField & {
  value?: string;
  isSaved: boolean;
  id?: string;
};

export const supportsOvnNetwork = (
  settings: LxdSettings | undefined,
): boolean => {
  return Boolean(
    settings?.config?.["network.ovn.northbound_connection"] ?? false,
  );
};

export const isClusteredServer = (
  settings: LxdSettings | undefined,
): boolean => {
  return settings?.environment?.server_clustered ?? false;
};

export const hasMicroCloudFlag = (settings?: LxdSettings): boolean => {
  return Boolean(settings?.config?.["user.microcloud"]);
};

export const getConfigFieldValue = (
  configField: ConfigField,
  settings?: LxdSettings,
): string | undefined => {
  for (const [key, value] of Object.entries(settings?.config ?? {})) {
    if (key === configField.key) {
      return value;
    }
  }
  if (configField.type === "bool") {
    return configField.default === "true" ? "true" : "false";
  }
  if (configField.default === "-") {
    return undefined;
  }
  return configField.default;
};

export const getConfigFieldClusteredValue = (
  clusteredSettings: LXDSettingOnClusterMember[],
  configField: ConfigField,
): ClusterSpecificValues => {
  const settingPerClusterMember: ClusterSpecificValues = {};

  clusteredSettings?.forEach((item) => {
    settingPerClusterMember[item.memberName] =
      item.config?.[configField.key] ?? configField.default ?? "";
  });
  return settingPerClusterMember;
};

export const getUserSettings = (
  configPairs: LxdConfigPair,
  projects: LxdProject[],
): UserSetting[] => {
  const settings: UserSetting[] = [
    {
      key: "user.ui_grafana_base_url",
      category: "user",
      default: "",
      longdesc:
        "e.g. https://example.org/dashboard?project={project}&name={instance}\n or https://192.0.2.1:3000/d/bGY-LSB7k/lxd?orgId=1",
      shortdesc:
        "LXD will replace `{instance}` and `{project}` with project and instance names for deep-linking to individual grafana pages.\nSee {ref}`grafana` for more information.",
      type: "string",
      isSaved: true,
    },
    {
      key: "user.ui_login_project",
      category: "user",
      default: getDefaultProject(projects),
      shortdesc: "Project to display on login.",
      type: "string",
      isSaved: true,
    },
    {
      key: "user.ui_theme",
      category: "user",
      default: "",
      shortdesc:
        "Set UI to dark theme, light theme, or to match the system theme.",
      type: "string",
      isSaved: true,
    },
    {
      key: "user.ui_title",
      category: "user",
      default: "",
      shortdesc:
        "Title for the LXD-UI web page. Shows the hostname when unset.",
      type: "string",
      isSaved: true,
    },
  ];

  Object.entries(configPairs ?? {})
    .filter(
      ([key, _]) =>
        key.startsWith("user.") && !settings.some((s) => s.key === key), //Do not duplicate ui user defined configs
    )
    .forEach(([key, _]) => {
      settings.push({
        key: key,
        category: "user",
        default: "",
        type: "string",
        isUserDefined: true,
        isSaved: true,
      });
    });

  return settings;
};
