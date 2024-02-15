import { FC, ReactNode } from "react";
import usePortal from "react-useportal";
import InstanceConfigureSnapshotModal from "./InstanceConfigureSnapshotModal";
import { Button } from "@canonical/react-components";
import { LxdInstance } from "types/instance";

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
      <Button onClick={openPortal} className={className} disabled={isDisabled}>
        See configuration
      </Button>
    </>
  );
};

export default InstanceConfigureSnapshotsBtn;
