import type { LxdSettings } from "types/server";

export const buildGrafanaUrl = (
  instance: string,
  project: string,
  settings?: LxdSettings,
): string => {
  const baseUrl = settings?.config?.["user.grafana_base_url"] ?? "";
  if (!baseUrl) {
    return "";
  }

  const templateUrl = baseUrl.includes("{instance}")
    ? baseUrl
    : `${baseUrl}&var-job=lxd&var-project={project}&var-name={instance}&var-top=5`;

  return templateUrl
    .replace("{instance}", encodeURIComponent(instance))
    .replace("{project}", encodeURIComponent(project));
};
