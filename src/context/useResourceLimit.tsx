import { useNotify } from "@canonical/react-components";
import { useResources } from "context/useResources";
import { getInstanceClusterMember } from "util/instances";
import { getResourceLimit } from "util/resourceLimits";
import { useCurrentProject } from "./useCurrentProject";
import { limitToBytes } from "util/limits";
import { ensureArray } from "util/helpers";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";

export const useResourceLimit = (
  mode: "cpu" | "memory",
  formik: InstanceAndProfileFormikProps,
) => {
  const notify = useNotify();
  const clusterMember = getInstanceClusterMember(formik);
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
