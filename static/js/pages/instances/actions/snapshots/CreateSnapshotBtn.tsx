import React, { FC, useState } from "react";
import { Button } from "@canonical/react-components";
import CreateSnapshotForm from "./CreateSnapshotForm";
import { LxdInstance } from "types/instance";

interface Props {
  instance: LxdInstance;
}

const CreateSnapshotBtn: FC<Props> = ({ instance }) => {
  const [isModal, setModal] = useState(false);

  const openModal = () => {
    setModal(true);
  };

  return (
    <>
      {isModal && (
        <CreateSnapshotForm instance={instance} close={() => setModal(false)} />
      )}
      <Button className="u-no-margin--bottom" hasIcon onClick={openModal}>
        <i className="p-icon--plus" />
        <span>Create snapshot</span>
      </Button>
    </>
  );
};

export default CreateSnapshotBtn;
