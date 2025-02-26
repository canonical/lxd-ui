import type { FC, ReactNode } from "react";
import { usePortal } from "@canonical/react-components";
import { Button, Tooltip } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import CreateInstanceSnapshotForm from "pages/instances/forms/CreateInstanceSnapshotForm";
import { useInstanceEntitlements } from "util/entitlements/instances";

interface Props {
  instance: LxdInstance;
  onSuccess: (message: ReactNode) => void;
  onFailure: (title: string, e: unknown, message?: ReactNode) => void;
  className?: string;
  isDisabled?: boolean;
}

const InstanceAddSnapshotBtn: FC<Props> = ({
  instance,
  onSuccess,
  isDisabled,
  className,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canManageInstanceSnapshots } = useInstanceEntitlements();

  return (
    <>
      {isOpen && (
        <Portal>
          <CreateInstanceSnapshotForm
            close={closePortal}
            instance={instance}
            onSuccess={onSuccess}
          />
        </Portal>
      )}
      <Button
        appearance="positive"
        className={className}
        onClick={openPortal}
        disabled={isDisabled || !canManageInstanceSnapshots(instance)}
        title={
          canManageInstanceSnapshots(instance)
            ? ""
            : "You do not have permission to create snapshots for this instance"
        }
      >
        {isDisabled ? (
          <Tooltip
            message={`Snapshot creation has been disabled for instances in the project ${instance.project}`}
          >
            Create snapshot
          </Tooltip>
        ) : (
          "Create snapshot"
        )}
      </Button>
    </>
  );
};

export default InstanceAddSnapshotBtn;
