import { FC, ReactNode } from "react";
import usePortal from "react-useportal";
import { Button, Icon } from "@canonical/react-components";
import { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import EditInstanceSnapshotForm from "pages/instances/forms/EditInstanceSnapshotForm";

interface Props {
  instance: LxdInstance;
  snapshot: LxdInstanceSnapshot;
  onSuccess: (message: ReactNode) => void;
  isDeleting: boolean;
  isRestoring: boolean;
}

const InstanceEditSnapshotBtn: FC<Props> = ({
  instance,
  snapshot,
  onSuccess,
  isDeleting,
  isRestoring,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      {isOpen && (
        <Portal>
          <EditInstanceSnapshotForm
            close={closePortal}
            instance={instance}
            onSuccess={onSuccess}
            snapshot={snapshot}
          />
        </Portal>
      )}
      <Button
        appearance="base"
        hasIcon
        dense={true}
        disabled={isDeleting || isRestoring}
        onClick={openPortal}
        type="button"
        aria-label="Edit snapshot"
        title="Edit"
      >
        <Icon name="edit" />
      </Button>
    </>
  );
};

export default InstanceEditSnapshotBtn;
