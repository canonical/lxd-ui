import React, { FC, useState } from "react";
import { Button } from "@canonical/react-components";
import CreateSnapshotForm from "../../modals/CreateSnapshotForm";
import { LxdInstance } from "../../types/instance";
import { NotificationHelper } from "../../types/notification";

interface Props {
  instance: LxdInstance;
  notify: NotificationHelper;
}

const CreateSnapshotBtn: FC<Props> = ({ instance, notify }) => {
  const [isModal, setModal] = useState(false);

  return (
    <>
      {isModal && (
        <CreateSnapshotForm
          instance={instance}
          close={() => setModal(false)}
          notify={notify}
        />
      )}
      <Button
        className="u-no-margin--bottom"
        hasIcon
        onClick={() => setModal(true)}
      >
        <i className="p-icon--plus" />
        <span>Create snapshot</span>
      </Button>
    </>
  );
};

export default CreateSnapshotBtn;
