import { FC, ReactNode } from "react";
import usePortal from "react-useportal";
import { Button, Tooltip } from "@canonical/react-components";
import { LxdInstance } from "types/instance";
import CreateInstanceSnapshotForm from "pages/instances/forms/CreateInstanceSnapshotForm";

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
        disabled={isDisabled}
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
