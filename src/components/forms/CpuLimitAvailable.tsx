import type { FC } from "react";
import type { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import { Icon } from "@canonical/react-components";
import { useResourceLimit } from "context/useResourceLimit";
import { ResourceLimitIcon } from "components/ResourceLimitIcon";

interface Props {
  formik: InstanceAndProfileFormikProps;
}

export const CpuLimitAvailable: FC<Props> = ({ formik }) => {
  const values = formik?.values as
    | CreateInstanceFormValues
    | EditInstanceFormValues;

  const resourceLimit = useResourceLimit("cpu", values);
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
      {sourceType && sourceName && (
        <ResourceLimitIcon source={sourceName} sourceType={sourceType} />
      )}
    </>
  );
};
