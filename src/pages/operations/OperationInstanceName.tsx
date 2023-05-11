import React, { FC } from "react";
import ItemName from "components/ItemName";
import { LxdOperation } from "types/operation";
import InstanceLink from "pages/instances/InstanceLink";
import { useParams } from "react-router-dom";
import { getInstanceName } from "util/operations";

interface Props {
  operation: LxdOperation;
}

const OperationInstanceName: FC<Props> = ({ operation }) => {
  const { project: projectName } = useParams<{
    project: string;
  }>();

  const instanceName = getInstanceName(operation);
  if (!instanceName) {
    return null;
  }

  const linkableDescriptions = [
    "Restarting instance",
    "Starting instance",
    "Stopping instance",
    "Unfreezing instance",
    "Freezing instance",
    "Snapshotting instance",
    "Restoring snapshot",
    // "Deleting snapshot",  broken response, see https://github.com/lxc/lxd/issues/11713
    // "Updating snapshot",  broken response, see https://github.com/lxc/lxd/issues/11713
    "Updating instance",
    "Renaming instance",
    "Executing command",
    "Showing console",
  ];
  const isLinkable =
    (operation.status === "Success" &&
      operation.description === "Creating instance") ||
    linkableDescriptions.includes(operation.description);

  if (isLinkable && projectName) {
    return (
      <InstanceLink
        instance={{
          name: instanceName,
          project: projectName,
        }}
      />
    );
  }

  return (
    <ItemName
      item={{
        name: instanceName,
      }}
    />
  );
};
export default OperationInstanceName;
