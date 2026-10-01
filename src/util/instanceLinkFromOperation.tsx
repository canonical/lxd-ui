import type { ReactNode } from "react";
import type { LxdOperationResponse } from "types/operation";
import { InstanceRichChip } from "pages/instances/InstanceRichChip";
import { getInstanceName } from "util/operations";

export const instanceLinkFromOperation = (args: {
  operation?: LxdOperationResponse;
  project?: string;
}): ReactNode | undefined => {
  const { operation, project } = args;
  const instanceName = getInstanceName(operation?.metadata);
  if (!instanceName) {
    return;
  }
  return (
    <InstanceRichChip
      instanceName={instanceName}
      projectName={project || "default"}
    />
  );
};
