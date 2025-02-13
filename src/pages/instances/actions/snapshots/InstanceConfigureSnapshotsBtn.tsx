import { FC, ReactNode } from "react";
import { usePortal } from "@canonical/react-components";
import InstanceConfigureSnapshotModal from "./InstanceConfigureSnapshotModal";
import { Button } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { useInstanceEntitlements } from "util/entitlements/instances";

interface Props {
  instance: LxdInstance;
  onSuccess: (message: ReactNode) => void;
  onFailure: (title: string, e: unknown, message?: ReactNode) => void;
  isDisabled?: boolean;
  className?: string;
}

const InstanceConfigureSnapshotsBtn: FC<Props> = ({
  instance,
  onSuccess,
  onFailure,
  isDisabled,
  className,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canEditInstance } = useInstanceEntitlements();

  return (
    <>
      {isOpen && (
        <Portal>
          <div className="snapshot-list">
            <InstanceConfigureSnapshotModal
              close={closePortal}
              instance={instance}
              onSuccess={onSuccess}
              onFailure={onFailure}
            />
          </div>
        </Portal>
      )}
      <Button
        onClick={openPortal}
        className={className}
        disabled={isDisabled || !canEditInstance(instance)}
        title={
          canEditInstance()
            ? ""
            : "You do not have permission to configure this instance"
        }
      >
        See configuration
      </Button>
    </>
  );
};

export default InstanceConfigureSnapshotsBtn;
