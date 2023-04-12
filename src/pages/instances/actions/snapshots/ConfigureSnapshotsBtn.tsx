import React, { FC, ReactNode, useState } from "react";
import { Button } from "@canonical/react-components";
import ConfigureSnapshotModal from "pages/instances/actions/snapshots/ConfigureSnapshotModal";
import { LxdInstance } from "types/instance";

interface Props {
  instance: LxdInstance;
  className?: string;
  isDisabled?: boolean;
  onSuccess: (message: ReactNode) => void;
  onFailure: (title: string, e: unknown) => void;
}

const ConfigureSnapshotsBtn: FC<Props> = ({
  instance,
  className,
  isDisabled = false,
  onSuccess,
  onFailure,
}) => {
  const [isModal, setModal] = useState(false);

  const closeModal = () => {
    setModal(false);
  };

  const openModal = () => {
    setModal(true);
  };

  return (
    <>
      {isModal && (
        <ConfigureSnapshotModal
          close={closeModal}
          instance={instance}
          onSuccess={onSuccess}
          onFailure={onFailure}
        />
      )}
      <Button onClick={openModal} className={className} disabled={isDisabled}>
        See configuration
      </Button>
    </>
  );
};

export default ConfigureSnapshotsBtn;
