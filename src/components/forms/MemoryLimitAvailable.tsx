import type { FC } from "react";
import { humanFileSize } from "util/helpers";
import { Icon } from "@canonical/react-components";
import { useResourceLimit } from "context/useResourceLimit";
import { ResourceLimitIcon } from "components/ResourceLimitIcon";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const MemoryLimitAvailable: FC<Props> = ({ formik }) => {
  const resourceLimit = useResourceLimit("memory", formik);
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
