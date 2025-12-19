import type { FC } from "react";
import { humanFileSize } from "util/helpers";
import { limitToBytes } from "util/limits";
import type { LxdProject } from "types/project";
import { Icon } from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import { getResourceLimitIcon } from "util/resourceLimits";
import { useResourceLimit } from "context/useResourceLimit";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project?: LxdProject;
}

const MemoryLimitAvailable: FC<Props> = ({ formik, project }) => {
  const values = formik?.values as
    | CreateInstanceFormValues
    | EditInstanceFormValues;

  const projectResourceMemory = project?.config["limits.memory"]
    ? limitToBytes(project?.config["limits.memory"])
    : undefined;

  const resourceLimit = useResourceLimit(
    (r) => r.memory.total,
    values,
    project,
    projectResourceMemory,
  );
  if (!resourceLimit) {
    return null;
  }
  const {
    min: minMemory,
    max: maxMemory,
    sourceType,
    sourceName,
  } = resourceLimit;

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
      {sourceName && sourceType && getResourceLimitIcon(sourceName, sourceType)}
    </>
  );
};
export default MemoryLimitAvailable;
