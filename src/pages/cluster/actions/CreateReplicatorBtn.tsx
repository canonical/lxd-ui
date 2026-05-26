import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";

export const CreateReplicatorButton: FC = () => {
  return (
    <Button
      name="Create replicator"
      hasIcon
      appearance="positive"
      className="u-no-margin--bottom"
    >
      <Icon name="plus" light className="u-margin--right" />
      <span>Create replicator</span>
    </Button>
  );
};
