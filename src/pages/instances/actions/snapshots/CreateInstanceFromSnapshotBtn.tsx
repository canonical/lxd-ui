import { FC } from "react";
import { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import { Button, Icon } from "@canonical/react-components";
import usePortal from "react-useportal";
import CreateInstanceFromSnapshotForm from "../../forms/CreateInstanceFromSnapshotForm";

interface Props {
  instance: LxdInstance;
  snapshot: LxdInstanceSnapshot;
  isDeleting: boolean;
  isRestoring: boolean;
}

const CreateInstanceFromSnapshotBtn: FC<Props> = ({
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
          <CreateInstanceFromSnapshotForm
            close={closePortal}
            instance={instance}
            snapshot={snapshot}
          />
        </Portal>
      )}
      <Button
        appearance="base"
        hasIcon
        dense
        aria-label="Create instance"
        disabled={isDeleting || isRestoring}
        onClick={openPortal}
        title="Create instance"
      >
        <Icon name="plus" />
      </Button>
    </>
  );
};

export default CreateInstanceFromSnapshotBtn;
