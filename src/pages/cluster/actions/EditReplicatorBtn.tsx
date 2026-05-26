import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import classnames from "classnames";
import type { LxdReplicator } from "types/replicator";
import { useReplicatorEntitlements } from "util/entitlements/replicators";

interface Props {
  replicator: LxdReplicator;
  className?: string;
  onClose?: () => void;
}

const EditReplicatorBtn: FC<Props> = ({ replicator, className, onClose }) => {
  const { canEditReplicator } = useReplicatorEntitlements();

  const disabledReason = () => {
    if (!canEditReplicator(replicator)) {
      return "You do not have permission to edit this replicator";
    }
    return undefined;
  };

  return (
    <Button
      appearance="default"
      aria-label="Edit replicator"
      className={classnames("u-no-margin--bottom has-icon", className)}
      onClick={() => {
        console.log(
          `Edit replicator ${replicator.name} btn clicked. TODO: open side panel`,
          onClose,
        );
      }}
      title={disabledReason()}
      disabled={Boolean(disabledReason())}
    >
      <Icon name="edit" />
      <span>Edit</span>
    </Button>
  );
};

export default EditReplicatorBtn;
