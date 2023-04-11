import React, { FC, useState } from "react";
import { Button } from "@canonical/react-components";
import ConfigureSnapshotModal from "pages/instances/actions/snapshots/ConfigureSnapshotModal";
import { LxdInstance } from "types/instance";

interface Props {
  instance: LxdInstance;
  className?: string;
}

const ConfigureSnapshotsBtn: FC<Props> = ({ instance, className }) => {
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
        <ConfigureSnapshotModal close={closeModal} instance={instance} />
      )}
      <Button onClick={openModal} className={className}>
        See configuration
      </Button>
    </>
  );
};

export default ConfigureSnapshotsBtn;
