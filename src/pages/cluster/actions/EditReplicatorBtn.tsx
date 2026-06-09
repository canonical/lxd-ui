import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import classnames from "classnames";
import type { LxdReplicator } from "types/replicator";
import { useReplicatorEntitlements } from "util/entitlements/replicators";
import usePanelParams from "util/usePanelParams";

interface Props {
  replicator: LxdReplicator;
  className?: string;
  hasLabel?: boolean;
  onClose?: () => void;
}

const EditReplicatorBtn: FC<Props> = ({
  replicator,
  className,
  onClose,
  hasLabel = false,
}) => {
  const { canEditReplicator } = useReplicatorEntitlements();
  const { openEditReplicator } = usePanelParams();

  const disabledReason = () => {
    if (!canEditReplicator(replicator)) {
      return "You do not have permission to edit this replicator";
    }
    return undefined;
  };

  return (
    <Button
      type="button"
      appearance={hasLabel ? "default" : "base"}
      aria-label="Edit replicator"
      className={classnames("u-no-margin--bottom has-icon", className, {
        "is-dense": !hasLabel,
      })}
      onClick={() => {
        openEditReplicator(replicator.project, replicator.name);
        onClose?.();
      }}
      title={disabledReason() ?? "Edit"}
      disabled={Boolean(disabledReason())}
    >
      <Icon name="edit" />
      {hasLabel && <span>Edit</span>}
    </Button>
  );
};

export default EditReplicatorBtn;
