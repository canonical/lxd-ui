import React, { FC } from "react";
import { Button } from "@canonical/react-components";

interface Props {
  openSnapshotForm: () => void;
}

const CreateSnapshotBtn: FC<Props> = ({ openSnapshotForm }) => {
  return (
    <Button className="u-no-margin--bottom" hasIcon onClick={openSnapshotForm}>
      <i className="p-icon--plus" />
      <span>Create snapshot</span>
    </Button>
  );
};

export default CreateSnapshotBtn;
