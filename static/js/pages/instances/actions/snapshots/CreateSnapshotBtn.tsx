import React, { FC } from "react";
import { Button } from "@canonical/react-components";

interface Props {
  openModal: () => void;
}

const CreateSnapshotBtn: FC<Props> = ({ openModal }) => {
  return (
    <>
      <Button className="u-no-margin--bottom" hasIcon onClick={openModal}>
        <i className="p-icon--plus" />
        <span>Create snapshot</span>
      </Button>
    </>
  );
};

export default CreateSnapshotBtn;
