import type { FC } from "react";
import { humanFileSize } from "util/helpers";
import { Icon } from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "../../types/forms/instanceAndProfileFormProps";
import type { CreateInstanceFormValues } from "types/forms/instanceAndProfile";
import type { EditInstanceFormValues } from "types/forms/instanceAndProfile";
import { useResourceLimit } from "context/useResourceLimit";
import { ResourceLimitIcon } from "components/ResourceLimitIcon";

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const MemoryLimitAvailable: FC<Props> = ({ formik }) => {
  const values = formik?.values as
    | CreateInstanceFormValues
    | EditInstanceFormValues;

  const resourceLimit = useResourceLimit("memory", values);
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
      {sourceName && sourceType && (
        <ResourceLimitIcon source={sourceName} sourceType={sourceType} />
      )}
    </>
  );
};
export default MemoryLimitAvailable;
