import { useNotify } from "@canonical/react-components";
import { useResources } from "context/useResources";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import type { LxdResources } from "types/resources";
import { CLUSTER_GROUP_PREFIX } from "util/instances";
import { getResourceLimit } from "util/resourceLimits";
import { useIsClustered } from "./useIsClustered";
import type { LxdProject } from "types/project";

export const useResourceLimit = (
  resourceExtractor: (resources: LxdResources) => number,
  formValues: CreateInstanceFormValues | EditInstanceFormValues,
  project?: LxdProject,
  projectResourceLimit?: number,
) => {
  const notify = useNotify();
  const isClustered = useIsClustered();
  const { target } = formValues as CreateInstanceFormValues;
  const { location } = formValues as EditInstanceFormValues;
  const isClusterGroupTarget = target?.startsWith(CLUSTER_GROUP_PREFIX);
  const validTarget = target && !isClusterGroupTarget ? target : undefined;
  const clusterMember = isClustered ? (validTarget ?? location) : undefined;
  const { data: resources, error, isLoading } = useResources(clusterMember);

  if (error) {
    notify.failure("Loading resources failed", error);
  }

  if (isLoading || !resources) {
    return null;
  }

  const resourceArray = Array.isArray(resources) ? resources : [resources];
  return getResourceLimit(
    resourceArray.map(resourceExtractor),
    clusterMember,
    project,
    projectResourceLimit,
  );
};
