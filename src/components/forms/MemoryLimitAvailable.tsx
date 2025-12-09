import type { FC } from "react";
import { useNotify, Spinner } from "@canonical/react-components";
import { humanFileSize } from "util/helpers";
import { limitToBytes } from "util/limits";
import type { LxdProject } from "types/project";
import { Icon } from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import { CLUSTER_GROUP_PREFIX } from "util/instances";
import ResourceLink from "components/ResourceLink";
import { useIsClustered } from "context/useIsClustered";
import { useResources } from "context/useResources";

interface MemoryLimit {
  min: number;
  max: number;
  source: "project" | "cluster-member" | "";
}
interface Props {
  formik?: InstanceAndProfileFormikProps;
  project?: LxdProject;
}

const MemoryLimitAvailable: FC<Props> = ({ formik, project }) => {
  const notify = useNotify();
  const isClustered = useIsClustered();
  const values = formik?.values;
  const projectResourceMemory = project?.config["limits.memory"]
    ? limitToBytes(project?.config["limits.memory"])
    : undefined;
  const { target } = values as CreateInstanceFormValues;
  const { location } = values as EditInstanceFormValues;
  const isClusterGroupTarget = target?.startsWith(CLUSTER_GROUP_PREFIX);
  const validTarget = target && !isClusterGroupTarget ? target : undefined;
  const clusterMember = isClustered ? (validTarget ?? location) : undefined;

  const { data: resources, error, isLoading } = useResources(clusterMember);

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading resources..." />;
  }
  if (error) {
    notify.failure("Loading resources failed", error);
    return null;
  }
  if (!resources) {
    return null;
  }

  const getSourceQualifier = (source: string) => {
    if (source === "project") {
      return (
        <>
          {"in project "}
          <ResourceLink
            type="project"
            value={project?.name || "default"}
            to={`/ui/projects/${encodeURIComponent(project?.name || "default")}`}
          />
        </>
      );
    }

    if (source === "cluster-member") {
      return (
        <>
          {"on cluster member "}
          <ResourceLink
            type="cluster-member"
            value={clusterMember ?? ""}
            to={`/ui/cluster/member/${encodeURIComponent(clusterMember ?? "")}`}
          />
        </>
      );
    }
    return null;
  };

  const getAvailableMemory = (): MemoryLimit => {
    const resourceArray = Array.isArray(resources) ? resources : [resources];
    const projectLimit = Number(projectResourceMemory);
    const resourcesMemories = resourceArray.map((r) => r.memory.total);
    const minResourceMemory = Math.min(...resourcesMemories);
    const maxResourceMemory = Math.max(...resourcesMemories);

    if (resourceArray.length === 0 || projectLimit < minResourceMemory) {
      return {
        min: projectLimit,
        max: projectLimit,
        source: projectLimit ? "project" : "",
      };
    }

    if (!projectResourceMemory || maxResourceMemory < projectLimit) {
      return {
        min: minResourceMemory,
        max: maxResourceMemory,
        source: clusterMember ? "cluster-member" : "",
      };
    }

    return {
      min: minResourceMemory,
      max: projectLimit,
      source: "",
    };
  };

  const { min: minMemory, max: maxMemory, source } = getAvailableMemory();
  const showHelpIcon = minMemory !== maxMemory;
  const helpIconText = `The available memory depends on the cluster member that the instance will be created on.\
  To determine the available memory exactly, go to the "Main configuration" section, and from\
  the "Target" dropdown, select the "Cluster Member" option, then choose a member.`;

  return (
    <>
      Total memory:{" "}
      <b>
        {humanFileSize(minMemory)}
        {minMemory !== maxMemory && ` - ${humanFileSize(maxMemory)}`}
        {showHelpIcon && (
          <>
            {" "}
            <Icon
              name="information"
              className="help-link-icon"
              title={helpIconText}
            />
          </>
        )}
      </b>
      <br />
      {getSourceQualifier(source)}
    </>
  );
};
export default MemoryLimitAvailable;
