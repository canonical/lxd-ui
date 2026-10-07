import type { FC } from "react";
import type { LxdOperationResponse } from "types/operation";
import { InstanceRichChip } from "./InstanceRichChip";
import { getInstanceName } from "util/operations";

interface Props {
  operation?: LxdOperationResponse;
  project?: string;
}

export const InstanceLinkFromOperation: FC<Props> = ({
  operation,
  project,
}) => {
  const instanceName = getInstanceName(operation?.metadata);
  if (!instanceName) {
    return null;
  }

  return (
    <InstanceRichChip
      instanceName={instanceName}
      projectName={project || "default"}
    />
  );
};
