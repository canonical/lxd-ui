import type { FC } from "react";
import { InstanceRichChip } from "pages/instances/InstanceRichChip";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";

interface Props {
  instanceName: string;
  projectName: string;
}

export const InstanceRichChipWithActions: FC<Props> = ({
  instanceName,
  projectName,
}) => {
  return (
    <InstanceRichChip
      instanceName={instanceName}
      projectName={projectName}
      actions={InstanceStateActions}
    />
  );
};
