import React, { FC, useState } from "react";
import { deleteInstance } from "../../api/instances";
import { LxdInstance } from "../../types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";
import ConfirmationButton from "../ConfirmationButton";
import { Tooltip } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
  notify: NotificationHelper;
}

const DeleteInstanceBtn: FC<Props> = ({ instance, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteInstance(instance)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        notify.success(`Instance ${instance.name} deleted.`);
        window.dispatchEvent(new Event("resize"));
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on instance delete.", e);
        window.dispatchEvent(new Event("resize"));
      });
  };

  const isDisabled = isLoading || instance.status !== "Stopped";

  return (
    <Tooltip
      message={isDisabled ? "Instance must be stopped" : undefined}
      position="left"
    >
      <ConfirmationButton
        isLoading={isLoading}
        iconClass="p-icon--delete"
        iconDescription="Delete"
        title="Confirm delete"
        toggleAppearance="base"
        toggleCaption="Delete instance"
        confirmationMessage={`Are you sure you want to delete instance "${instance.name}"?
                            This action cannot be undone, and can result in data loss.`}
        posButtonLabel="Delete"
        onConfirm={handleDelete}
        isDisabled={isDisabled}
      />
    </Tooltip>
  );
};

export default DeleteInstanceBtn;
