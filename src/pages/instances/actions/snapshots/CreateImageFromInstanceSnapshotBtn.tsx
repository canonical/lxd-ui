import { FC } from "react";
import usePortal from "react-useportal";
import { Button, Icon } from "@canonical/react-components";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import CreateImageFromInstanceSnapshotForm from "pages/instances/forms/CreateImageFromInstanceSnapshotForm";

interface Props {
  instance: LxdInstance;
  snapshot: LxdInstanceSnapshot;
  isDeleting: boolean;
  isRestoring: boolean;
}

const CreateImageFromInstanceSnapshotBtn: FC<Props> = ({
  instance,
  snapshot,
  isDeleting,
  isRestoring,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      {isOpen && (
        <Portal>
          <CreateImageFromInstanceSnapshotForm
            close={closePortal}
            instance={instance}
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
        aria-label="Create image"
        title="Create image"
      >
        <Icon name="export" />
      </Button>
    </>
  );
};

export default CreateImageFromInstanceSnapshotBtn;
