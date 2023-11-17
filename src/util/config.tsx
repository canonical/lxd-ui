import { LxcConfigOptionCategories, ConfigField } from "types/config";

export const toConfigFields = (
  categories: LxcConfigOptionCategories,
): ConfigField[] => {
  const result: ConfigField[] = [];

  for (const [categoryKey, categoryValue] of Object.entries(categories)) {
    for (const configOption of categoryValue.keys) {
      for (const [key, value] of Object.entries(configOption)) {
        const configField = {
          ...value,
          category: categoryKey,
          default: value.defaultdesc?.startsWith("`")
            ? value.defaultdesc.split("`")[1]
            : "",
          key,
        };
        result.push(configField);
      }
    }
  }

  return result;
};

const docLinkReplacements = {
  "{config:option}`instance-raw:raw.idmap":
    "/reference/instance_options/#instance-raw:raw.idmap",
  "{config:option}`instance-raw:raw.lxc":
    "/reference/instance_options/#instance-raw:raw.lxc",
  "{config:option}`instance-raw:raw.qemu":
    "/reference/instance_options/#instance-raw:raw.qemu",
  "{config:option}`instance-resource-limits:limits.cpu":
    "/reference/instance_options/#instance-resource-limits:limits.cpu",
  "{config:option}`instance-resource-limits:limits.memory":
    "/reference/instance_options/#instance-resource-limits:limits.memory",
  "{config:option}`instance-resource-limits:limits.processes":
    "/reference/instance_options/#instance-resource-limits:limits.processes",
  "{config:option}`instance-security:security.csm":
    "/reference/instance_options/#instance-security:security.csm",
  "{config:option}`instance-security:security.idmap.isolated":
    "/reference/instance_options/#instance-security:security.idmap.isolated",
  "{config:option}`instance-security:security.nesting":
    "/reference/instance_options/#instance-security:security.nesting",
  "{config:option}`instance-security:security.privileged":
    "/reference/instance_options/#instance-security:security.privileged",
  "{config:option}`instance-security:security.secureboot":
    "/reference/instance_options/#instance-security:security.secureboot",
  "{config:option}`project-restricted:restricted.devices.disk":
    "/reference/projects/#project-restricted:restricted.devices.disk",
  "{config:option}`project-restricted:restricted.devices.nic":
    "/reference/projects/#project-restricted:restricted.devices.nic",
  "{ref}`cluster-evacuate": "/howto/cluster_manage/#cluster-evacuate",
  "{ref}`cluster-https-address":
    "/howto/cluster_config_networks/#cluster-https-address",
  "{ref}`clustering-instance-placement":
    "/explanation/clustering/#clustering-instance-placement",
  "{ref}`clustering-instance-placement-scriptlet":
    "/explanation/clustering/#clustering-instance-placement-scriptlet",
  "{ref}`dev-lxd": "/dev-lxd/#dev-lxd",
  "{ref}`howto-storage-buckets":
    "/howto/storage_buckets/#howto-storage-buckets",
  "{ref}`instance-options-limits-cpu":
    "/reference/instance_options/#instance-options-limits-cpu",
  "{ref}`instance-options-limits-cpu-container":
    "/reference/instance_options/#instance-options-limits-cpu-container",
  "{ref}`instance-options-qemu":
    "/reference/instance_options/#instance-options-qemu",
  "{ref}`instance-options-snapshots-names":
    "/reference/instance_options/#instance-options-snapshots-names",
  "{ref}`instances-limit-units":
    "/reference/instance_units/#instances-limit-units",
  "{ref}`metrics": "/metrics/#metrics",
  "{ref}`network-bgp": "/howto/network_bgp/#network-bgp",
  "{ref}`network-dns-server": "/howto/network_zones/#network-dns-server",
  "{ref}`server-expose": "/howto/server_expose/#server-expose",
};

export const configDescriptionToHtml = (input: string, docBaseLink: string) => {
  // special characters
  let result = input
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\n", "<br>");

  // documentation links
  Object.entries(docLinkReplacements).forEach(([key, value]) => {
    const href = `${docBaseLink}${value}`;
    const linkText = key
      .substring(key.lastIndexOf("`") + 1)
      .split(":")
      .pop()
      ?.replaceAll("-", " ");
    result = result.replaceAll(
      key + "`",
      `<a href="${href}" target="_blank" rel="noreferrer">${linkText}</a>`,
    );
  });

  // code blocks
  let count = 0;
  while (result.includes("`") && count++ < 100) {
    result = result.replace("`", "<code>").replace("`", "</code>");
  }

  return result;
};
