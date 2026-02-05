import { useNotify } from "@canonical/react-components";
import { useResources } from "context/useResources";
import type { CreateInstanceFormValues } from "types/forms/instanceAndProfile";
import type { EditInstanceFormValues } from "types/forms/instanceAndProfile";
import { CLUSTER_GROUP_PREFIX } from "util/instances";
import { getResourceLimit } from "util/resourceLimits";
import { useIsClustered } from "./useIsClustered";
import { useCurrentProject } from "./useCurrentProject";
import { limitToBytes } from "util/limits";
import type { LxdResources } from "types/resources";

export const ensureArray = (resources: LxdResources | LxdResources[]) =>
  Array.isArray(resources) ? resources : [resources];

export const useResourceLimit = (
  mode: "cpu" | "memory",
  formValues: CreateInstanceFormValues | EditInstanceFormValues,
) => {
  const notify = useNotify();
  const isClustered = useIsClustered();
  const { target } = formValues as CreateInstanceFormValues;
  const { location } = formValues as EditInstanceFormValues;
  const isClusterGroupTarget = target?.startsWith(CLUSTER_GROUP_PREFIX);
  const validTarget = target && !isClusterGroupTarget ? target : undefined;
  const clusterMember = isClustered ? (validTarget ?? location) : undefined;
  const { data: resources, error, isLoading } = useResources(clusterMember);
  const { project } = useCurrentProject();
  const resourceLimitName = mode === "memory" ? "limits.memory" : "limits.cpu";
  const projectResourceLimit = project?.config[resourceLimitName]
    ? limitToBytes(project?.config[resourceLimitName])
    : undefined;

  if (error) {
    notify.failure("Loading resources failed", error);
    return null;
  }

  if (isLoading || !resources) {
    return null;
  }

  const resourceArray = ensureArray(resources);
  const mappedResources = resourceArray.map((r) => {
    if (mode === "cpu") {
      return r.cpu.total;
    } else {
      return r.memory.total;
    }
  });

  return getResourceLimit(
    mappedResources,
    clusterMember,
    project,
    projectResourceLimit,
  );
};
