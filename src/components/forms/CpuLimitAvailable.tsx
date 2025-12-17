import type { FC } from "react";
import type { LxdProject } from "types/project";
import type { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import { limitToBytes } from "util/limits";
import { Icon } from "@canonical/react-components";
import { getResourceLimitIcon } from "util/resourceLimits";
import { useResourceLimit } from "context/useResourceLimit";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project?: LxdProject;
}

export const CpuLimitAvailable: FC<Props> = ({ project, formik }) => {
  const values = formik?.values as
    | CreateInstanceFormValues
    | EditInstanceFormValues;
  const projectResourceCpu = project?.config["limits.cpu"]
    ? limitToBytes(project?.config["limits.cpu"])
    : undefined;
  const resourceLimit = useResourceLimit(
    (r) => r.cpu.total,
    values,
    project,
    projectResourceCpu,
  );
  if (!resourceLimit) {
    return null;
  }
  const { min: minCpu, max: maxCpu, sourceType, sourceName } = resourceLimit;
  const showHelpIcon = minCpu !== maxCpu;
  const helpIconText = `The total number of CPU cores depends on the cluster member that the instance will be created on.\
      To determine the number of cores exactly, go to the "Main configuration" section, and from\
      the "Target" dropdown, select the "Cluster Member" option, then choose a member.`;
  return (
    <>
      Total number of CPU cores:{" "}
      <b>
        {minCpu}
        {minCpu !== maxCpu && ` - ${maxCpu}`}
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
      {sourceType &&
        sourceName &&
        getResourceLimitIcon(sourceName, sourceType)}{" "}
    </>
  );
};
